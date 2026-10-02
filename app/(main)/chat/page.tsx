import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MessageSquare, Sparkles } from "lucide-react";

export default function ChatPage() {
  return (
    <>
      <Breadcrumbs current="Chat" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Sessions</h1>
          <p className="text-gray-500 mt-1">Converse with your Knowledge Assistant</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive RAG Chat</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This section is structured for instant natural language Q&A against indexed knowledge bases.
        </p>
      </div>
    </>
  );
}
