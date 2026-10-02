"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  Eye,
  Cpu,
  FileText,
  CheckCircle2,
  Trash2,
  FileCode,
  FileIcon,
  Loader2,
} from "lucide-react";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
}

export function AddDocumentModal({ isOpen, onClose }: AddDocumentModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<"uploads" | "preview" | "process">("uploads");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleUpload = () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setActiveStep("process");

    // Simulate upload / processing flow
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFiles([]);
        setActiveStep("uploads");
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop & Dark Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Rectangle Form Interface Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-950/20 border border-slate-100 p-6 sm:p-8 z-10 transition-all duration-300 transform animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add document</h2>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            upload a document to your knowledge base . supported format pdf docx markdown and text files
          </p>
        </div>

        {/* 3 Aligned Icons with In-Between Spacing */}
        <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl p-4 mb-6 border border-slate-100">
          {/* Step 1: Uploads */}
          <div
            onClick={() => setActiveStep("uploads")}
            className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
              activeStep === "uploads" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeStep === "uploads"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border border-gray-200"
              }`}
            >
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide capitalize">uploads</span>
          </div>

          {/* Connector Line 1 */}
          <div className="flex-1 h-0.5 mx-2 bg-gray-200 rounded" />

          {/* Step 2: Preview */}
          <div
            onClick={() => files.length > 0 && setActiveStep("preview")}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeStep === "preview"
                ? "text-blue-600"
                : files.length > 0
                ? "text-gray-400 hover:text-gray-600 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeStep === "preview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide capitalize">preview</span>
          </div>

          {/* Connector Line 2 */}
          <div className="flex-1 h-0.5 mx-2 bg-gray-200 rounded" />

          {/* Step 3: Process */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeStep === "process" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeStep === "process"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide capitalize">process</span>
          </div>
        </div>

        {/* Step Content: Uploads / Preview View */}
        {activeStep === "preview" && files.length > 0 ? (
          <div className="mb-6 space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                Document Preview ({files.length})
              </span>
              <button
                onClick={() => setActiveStep("uploads")}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + Add more
              </button>
            </div>
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getFileIcon(item.type)}
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Drop Files Area */
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
        )}

        {/* Upload File Button */}
        <div>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
              files.length === 0 || isUploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : isSuccess
                ? "bg-green-600 text-white shadow-green-100"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-[0.99]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Uploading...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Uploaded Successfully!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload file</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
