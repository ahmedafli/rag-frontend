import React from "react";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-8 relative pt-20 md:pt-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
