"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { AddDocumentModal } from "@/components/AddDocumentModal";

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="hero-gradient border border-blue-50/50 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
            Knowledge Assistant
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Your personal AI-powered knowledge hub. Upload documents, create knowledge bases, and get instant answers through natural conversations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          id="hero-new-kb-btn"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Knowledge Base</span>
        </button>
      </section>

      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

