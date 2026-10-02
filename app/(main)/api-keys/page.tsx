import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Key } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <>
      <Breadcrumbs current="API Keys" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">Manage API credentials and LLM provider keys</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">API & Credentials Management</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This section is structured for managing OpenAI, Anthropic, or custom backend API integration keys.
        </p>
      </div>
    </>
  );
}
