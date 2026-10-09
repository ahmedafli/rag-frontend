"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Database,
  Plus,
  FileText,
  CheckCircle2,
  Loader2,
  XCircle,
  RefreshCw,
  Trash2,
  Clock,
  Layers,
  FileCode,
  FileIcon,
} from "lucide-react";
import { AddDocumentModal, DocumentItem } from "@/components/AddDocumentModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function KnowledgeBasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isFetchingInitial, setIsFetchingInitial] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Map of active polling interval timers by document ID
  const activePollers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Track document IDs where polling has been permanently stopped
  const stoppedPollers = useRef<Set<string>>(new Set());
  // Track poll counts per document to enforce a max timeout limit
  const pollCounts = useRef<Map<string, number>>(new Map());

  // Clear the polling timer for a document without permanently stopping it
  const clearPollingTimer = useCallback((id: string) => {
    const timer = activePollers.current.get(id);
    if (timer) {
      clearInterval(timer);
      activePollers.current.delete(id);
    }
  }, []);

  // Permanently stop polling a specific document ID
  const stopPolling = useCallback((id: string) => {
    stoppedPollers.current.add(id);
    clearPollingTimer(id);
  }, [clearPollingTimer]);

  // Poll state for a specific document ID
  const pollDocumentStatus = useCallback(
    async (id: string) => {
      // Don't poll if already stopped
      if (stoppedPollers.current.has(id)) return;

      const currentCount = (pollCounts.current.get(id) || 0) + 1;
      pollCounts.current.set(id, currentCount);

      // Timeout after 60 attempts (120 seconds at 2-second interval)
      if (currentCount > 60) {
        console.warn(`[POLL TIMEOUT] Stopped polling doc ${id} after 60 attempts.`);
        stopPolling(id);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? {
                ...doc,
                status: "failed",
                error_message: "Processing timed out after 120s",
              }
              : doc
          )
        );
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/documents/${id}`);
        if (!response.ok) {
          if (response.status === 404 && currentCount > 5) {
            stopPolling(id);
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === id
                  ? { ...doc, status: "failed", error_message: "Document not found on server" }
                  : doc
              )
            );
          }
          return;
        }

        const data: DocumentItem = await response.json();
        console.log(`[GET /documents/${id} Poll #${currentCount}]:`, data);

        const statusLower = (data.status || "").toLowerCase();
        const isReady =
          statusLower === "ready" || statusLower === "completed" || statusLower === "done";
        const isFailed = statusLower === "failed" || statusLower === "error";

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? {
                ...doc,
                ...data,
                status: isReady ? "ready" : isFailed ? "failed" : "processing",
                filename: data.filename || doc.filename,
              }
              : doc
          )
        );

        // Terminal statuses stop polling permanently
        if (isReady || isFailed) {
          console.log(`[POLL FINISHED] Stopping polling for ${id} (status: ${data.status})`);
          stopPolling(id);
        }
      } catch (err) {
        console.error(`Error polling document ${id}:`, err);
      }
    },
    [stopPolling]
  );

  // Start polling a specific document ID every 2 seconds
  const startPolling = useCallback(
    (id: string) => {
      // Clear the permanent-stop flag so polling can proceed
      stoppedPollers.current.delete(id);
      // Reset poll count for a fresh start
      pollCounts.current.delete(id);
      // Clear any existing timer without marking as permanently stopped
      clearPollingTimer(id);

      // Immediately poll once, then set up interval
      pollDocumentStatus(id);

      const timer = setInterval(() => {
        pollDocumentStatus(id);
      }, 2000);

      activePollers.current.set(id, timer);
    },
    [pollDocumentStatus, clearPollingTimer]
  );

  // Fetch initial documents list from backend if endpoint is supported
  const fetchAllDocuments = useCallback(async () => {
    setIsFetchingInitial(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      }
    } catch (_) {
      // Backend may not support GET /documents list, fallback to local state
    } finally {
      setIsFetchingInitial(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  // Monitor documents list and trigger polling ONLY for active processing docs
  useEffect(() => {
    documents.forEach((doc) => {
      const statusLower = (doc.status || "").toLowerCase();
      if (
        statusLower === "processing" &&
        !activePollers.current.has(doc.id) &&
        !stoppedPollers.current.has(doc.id)
      ) {
        startPolling(doc.id);
      }
    });
  }, [documents, startPolling]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      activePollers.current.forEach((timer) => clearInterval(timer));
      activePollers.current.clear();
    };
  }, []);

  const handleDocumentsAdded = (newDocs: DocumentItem[]) => {
    setDocuments((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const filteredNew = newDocs.filter((d) => !existingIds.has(d.id));
      return [...filteredNew, ...prev];
    });

    newDocs.forEach((doc) => {
      if ((doc.status || "").toLowerCase() === "processing") {
        startPolling(doc.id);
      }
    });
  };

  const handleDeleteDocument = async (id: string) => {
    console.log("🗑️ Delete initiated for document ID:", id);
    if (deletingIds.has(id)) return;

    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      const url = `${API_BASE_URL}/documents/${id}`;
      console.log(`[DELETE Request] Sending DELETE to: ${url}`);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`[DELETE Response] Status: ${response.status}`, response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[DELETE Failed] Server responded with error:", errorData);
        const errorMessage =
          errorData.detail || `Failed to delete document (Status: ${response.status})`;
        alert(errorMessage);
        return;
      }

      const responseData = await response.json().catch(() => ({}));
      console.log("[DELETE Success] Backend returned:", responseData);

      // Stop any active polling timer for this document
      stopPolling(id);

      // Remove row from interface upon successful backend deletion
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      console.log("✅ Row removed from UI for document ID:", id);
    } catch (err) {
      console.error(`[DELETE Exception] Error deleting document ${id}:`, err);
      alert(`Failed to connect to backend server: ${err}`);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case "docx":
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      case "md":
      case "markdown":
        return <FileCode className="w-5 h-5 text-purple-500 flex-shrink-0" />;
      default:
        return <FileIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Just now";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return isoString;
    }
  };

  return (
    <>
      <Breadcrumbs current="Knowledge Base" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage document ingestion, embedding indexing, and vector store status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllDocuments}
            disabled={isFetchingInitial}
            className="p-2.5 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            title="Refresh documents"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingInitial ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md shadow-blue-100 cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Documents Table or Empty State */}
      {documents.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                  <th className="py-4 px-6">Document Name</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Indexed Chunks</th>
                  <th className="py-4 px-6">Uploaded At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Document Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.filename)}
                        <div>
                          <p className="font-semibold text-gray-900 truncate max-w-xs">{doc.filename}</p>
                          <p className="text-[11px] text-gray-400 font-mono">ID: {doc.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {doc.status === "processing" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          <span>Processing</span>
                        </span>
                      )}
                      {doc.status === "ready" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ready</span>
                        </span>
                      )}
                      {doc.status === "failed" && (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 w-fit">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Failed</span>
                          </span>
                          {doc.error_message && (
                            <span className="text-[11px] text-red-500 mt-1 max-w-xs truncate">
                              {doc.error_message}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Indexed Chunks */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-xs">
                          {doc.chunk_count !== undefined ? `${doc.chunk_count} chunks` : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Uploaded At */}
                    <td className="py-4 px-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(doc.uploaded_at)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingIds.has(doc.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete document"
                      >
                        {deletingIds.has(doc.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No documents indexed yet</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Upload PDF, DOCX, Markdown, or TXT files to parse, chunk, and store embeddings in your vector database.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-md shadow-blue-100 cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Document</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleDocumentsAdded}
      />
    </>
  );
}
