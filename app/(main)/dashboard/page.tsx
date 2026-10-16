"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroSection } from "@/components/HeroSection";
import { StatsCard } from "@/components/StatsCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { HowItWorks } from "@/components/HowItWorks";
import { Database, MessageCircle, Brain, UploadCloud, Sparkles } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const SESSION_KEY = "rag_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export default function DashboardPage() {
  const [kbCount, setKbCount] = useState<number | null>(null);
  const [chatCount, setChatCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch knowledge base (documents) count
    fetch(`${API_BASE_URL}/documents`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data)) setKbCount(data.length);
      })
      .catch(() => setKbCount(0));

    // Fetch chat session (conversations) count using the same session_id as the chat page
    const sid = getOrCreateSessionId();
    if (sid) {
      fetch(`${API_BASE_URL}/conversations?session_id=${encodeURIComponent(sid)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (Array.isArray(data)) setChatCount(data.length);
        })
        .catch(() => setChatCount(0));
    } else {
      setChatCount(0);
    }
  }, []);

  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumbs current="Dashboard" />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <StatsCard
          id="stats-link-kb"
          icon={Database}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-500"
          count={kbCount ?? 0}
          label="Knowledge Bases"
          linkHref="/knowledge-base"
          linkLabel="View all knowledge bases"
        />

        <StatsCard
          id="stats-link-chat"
          icon={MessageCircle}
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-500"
          count={chatCount ?? 0}
          label="Chat Sessions"
          linkHref="/chat"
          linkLabel="View all chat sessions"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            id="action-create-kb"
            href="/knowledge-base"
            icon={Brain}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-500"
            hoverBorderClass="hover:border-blue-200"
            hoverShadowClass="hover:shadow-blue-50/50"
            title="Create Knowledge Base"
            description="Build a new AI-powered knowledge repository"
          />

          <QuickActionCard
            id="action-upload"
            href="/knowledge-base"
            icon={UploadCloud}
            iconBgClass="bg-indigo-50"
            iconColorClass="text-indigo-500"
            hoverBorderClass="hover:border-indigo-200"
            hoverShadowClass="hover:shadow-indigo-50/50"
            title="Upload Documents"
            description="Add PDF, DOCX, MD or TXT files to your knowledge bases"
          />

          <QuickActionCard
            id="action-chat"
            href="/chat"
            icon={Sparkles}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-500"
            hoverBorderClass="hover:border-purple-200"
            hoverShadowClass="hover:shadow-purple-50/50"
            title="Start Chatting"
            description="Get instant answers from your knowledge with AI"
          />
        </div>
      </div>

      {/* How It Works */}
      <HowItWorks />
    </>
  );
}
