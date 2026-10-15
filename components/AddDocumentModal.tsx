"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileText,
  FileCode,
  FileIcon,
  Loader2,
  XCircle,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export interface DocumentItem {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  chunk_count?: number;
  uploaded_at?: string;
  error_message?: string;
}

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (documents: DocumentItem[]) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
}

export function AddDocumentModal({ isOpen, onClose, onUploadSuccess }: AddDocumentModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Pre-load demo file sample_rag_notes.pdf when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingDemo(true);
    setUploadError(null);

    const loadDemoFile = async () => {
      try {
        const response = await fetch("/sample_rag_notes.pdf");
        if (!response.ok) {
          throw new Error("Could not find demo file /sample_rag_notes.pdf");
        }
        const blob = await response.blob();
        const demoFile = new File([blob], "sample_rag_notes.pdf", {
          type: "application/pdf",
        });

        if (isMounted) {
          setFiles([
            {
              id: "demo-sample-rag-notes",
              file: demoFile,
              name: "sample_rag_notes.pdf",
              size: formatFileSize(blob.size || 3493),
              type: "pdf",
            },
          ]);
          setIsLoadingDemo(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading demo file:", err);
          setUploadError("Could not load the sample demo file. Please ensure /sample_rag_notes.pdf exists.");
          setIsLoadingDemo(false);
        }
      }
    };

    loadDemoFile();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsUploading(false);
    setUploadError(null);
    onClose();
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Locked: Custom user uploads are disabled in demo mode
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "docx":
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "md":
      case "markdown":
        return <FileCode className="w-5 h-5 text-purple-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || isLoadingDemo) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const formData = new FormData();
      files.forEach((fileItem) => {
        formData.append("files", fileItem.file);
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            errorMessage =
              typeof errorJson.detail === "string"
                ? errorJson.detail
                : JSON.stringify(errorJson.detail);
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (_) {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[POST /upload Response]:", data);

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array from backend");
      }

      const createdDocs: DocumentItem[] = data.map((item: any, index: number) => ({
        id: item.id,
        filename: item.filename || files[index]?.name || "Document",
        status: item.status || "processing",
        chunk_count: item.chunk_count,
        uploaded_at: item.uploaded_at || new Date().toISOString(),
        error_message: item.error_message,
      }));

      if (onUploadSuccess) {
        onUploadSuccess(createdDocs);
      }

      // Close modal immediately after successful response
      handleClose();
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(
        err.message ||
          "Failed to upload file. Please check if the backend is running at http://127.0.0.1:8000."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop & Dark Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-950/20 border border-slate-100 p-6 sm:p-8 z-10 transition-all duration-300 transform animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add document</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Demo Mode
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            Test document ingestion and embedding indexing with our pre-loaded demo document.
          </p>
        </div>

        {/* Notice Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/40 border border-amber-200/80 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5 shadow-xs">
              <Lock className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                  Testing Notice
                </span>
                <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
                  Locked
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                curently users can only test this app with the demo file , for many uploads you need to go premuim
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert (if upload POST request failed) */}
        {uploadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-red-800">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>Upload Request Failed</span>
            </div>
            <p className="text-xs text-red-600 leading-relaxed">{uploadError}</p>
          </div>
        )}

        {/* Drop Files Area - Locked to Demo File Only */}
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-amber-200/90 bg-gradient-to-b from-amber-50/30 to-slate-50/60 rounded-2xl p-6 text-center cursor-not-allowed select-none transition-all flex flex-col items-center justify-center"
          >
            <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-3 shadow-xs border border-amber-200/60 relative">
              <UploadCloud className="w-6 h-6 text-amber-600" />
              <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full shadow-xs">
                <Lock className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-1.5">
              <Lock className="w-3 h-3" />
              <span>Upload Locked to Demo File</span>
            </div>

            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              curently users can only test this app with the demo file , for many uploads you need to go premuim
            </p>
          </div>

          {/* Attached Demo File Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-gray-600">
                Selected Demo File
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Demo Ready
              </span>
            </div>

            {isLoadingDemo ? (
              <div className="flex items-center justify-center p-4 bg-slate-50 border border-gray-100 rounded-xl text-gray-500 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading demo file (sample_rag_notes.pdf)...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200/90 rounded-xl shadow-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-red-50 rounded-lg">
                        {getFileIcon(item.type)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                            Demo
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {item.size} • PDF Document
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs text-gray-500 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100"
                      title="Custom uploads disabled"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] font-medium text-gray-600">Locked</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || isLoadingDemo}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              files.length === 0 || isUploading || isLoadingDemo
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-[0.99]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading demo file...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Demo File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
