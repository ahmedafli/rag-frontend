"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Database, Plus } from "lucide-react";
import { AddDocumentModal } from "@/components/AddDocumentModal";

export default function KnowledgeBasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Breadcrumbs current="Knowledge Base" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Bases</h1>
          <p className="text-gray-500 mt-1">Manage your document collections and RAG indexing</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md shadow-blue-100 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Knowledge Base</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Knowledge Base Management</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This section is structured for future RAG document ingestion, embedding indexing, and vector store configuration.
        </p>
      </div>

      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

