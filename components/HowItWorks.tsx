import React from "react";
import { Search } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Create a Knowledge Base",
      description:
        "Define the scope and category of your AI assistant's domain.",
      hasConnector: true,
    },
    {
      step: 2,
      title: "Upload and Index Documents",
      description:
        "Our AI processes and indexes your data for instant retrieval.",
      hasConnector: true,
    },
    {
      step: 3,
      title: "Start Chatting",
      description:
        "Interact with your documents using natural language queries.",
      hasConnector: false,
    },
  ];

  return (
    <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10">
      <div className="flex items-center gap-2 text-blue-600 mb-8">
        <Search className="w-5 h-5 text-xl" />
        <h2 className="text-xl font-bold">How It Works</h2>
      </div>

      <div className="space-y-10 max-w-2xl">
        {steps.map((item) => (
          <div key={item.step} className="flex items-start gap-6 relative">
            {item.hasConnector && (
              <div className="absolute left-5 top-10 w-0.5 h-16 bg-blue-100" />
            )}
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 z-10">
              {item.step}
            </div>
            <div className="pt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-gray-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
