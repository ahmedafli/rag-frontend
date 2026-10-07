"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  FileCode,
  FileIcon,
  Loader2,
  XCircle,
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
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFiles([]);
    setIsUploading(false);
    setUploadError(null);
  };

  const handleClose = () => {
    resetForm();
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.split(".").pop()?.toLowerCase() || "",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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
    if (files.length === 0) return;

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

      // Close the modal immediately after receiving doc_id/response
      handleClose();
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(
        err.message ||
          "Failed to upload files. Please check if the backend is running at http://127.0.0.1:8000."
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
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add document</h2>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            Upload documents to your knowledge base. Supported formats: PDF, DOCX, MD, and TXT files.
          </p>
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

        {/* Drop Files Area */}
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              isDragging
                ? "border-blue-500 bg-blue-50/60 scale-[0.99]"
                : "border-gray-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.md,.markdown,.txt"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-sm border border-blue-100/50">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-gray-800 mb-1">
              Drop files here, or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              Supports PDF, DOCX, MD, and TXT files up to 25MB each
            </p>
          </div>

          {/* List of Attached Files (if any) */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-gray-500">
                  Selected files ({files.length})
                </span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Clear all
                </button>
              </div>
              {files.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl shadow-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {getFileIcon(item.type)}
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {item.size}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              files.length === 0 || isUploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-[0.99]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload file{files.length > 1 ? "s" : ""}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
