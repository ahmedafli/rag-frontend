"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DocumentItem } from "@/components/AddDocumentModal";
import {
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  FileCode,
  FileIcon,
  ChevronDown,
  BookOpen,
  Sparkles,
  Database,
  Check,
  Table,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface Source {
  n?: number;
  source?: string;
  filename?: string;
  name?: string;
  document?: string;
  document_name?: string;
  rerank_score?: number;
  score?: number;
  similarity?: number;
  page?: number | string;
  page_number?: number | string;
  content?: string;
  text?: string;
  chunk?: string;
  [key: string]: unknown;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />;
    case "docx":
    case "doc":
      return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case "md":
    case "markdown":
      return <FileCode className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    default:
      return <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />;
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ── Document Selector ──────────────────────────────────────────────────────── */

interface DocSelectorProps {
  documents: DocumentItem[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleDoc: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}

function DocumentSelector({
  documents,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggleDoc,
  isLoading,
  isError,
  onRefresh,
}: DocSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const readyCount = documents.filter((d) => d.status === "ready").length;
  const label = allSelected
    ? "All documents"
    : selectedIds.size === 1
      ? "1 document"
      : `${selectedIds.size} documents`;

  return (
    <div ref={ref} className="relative">
      <button
        id="doc-selector-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">{isLoading ? "Loading…" : label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Search scope
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
              title="Refresh document list"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Failed to load documents.</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading documents…</span>
            </div>
          )}

          {!isLoading && (
            <div className="max-h-64 overflow-y-auto">
              {/* All Documents */}
              <button
                id="doc-select-all"
                type="button"
                onClick={onToggleAll}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/60 transition-colors text-left cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${allSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                    }`}
                >
                  {allSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">
                  All documents
                </span>
              </button>

              {readyCount === 0 && documents.length > 0 && (
                <p className="px-4 py-3 text-xs text-gray-400 text-center">
                  No documents are ready yet — still processing.
                </p>
              )}

              {documents.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400 text-center">
                  No documents uploaded yet.
                </p>
              )}

              {documents.length > 0 && (
                <div className="border-t border-gray-100 mx-3" />
              )}

              {documents.map((doc) => {
                const isReady = doc.status === "ready";
                const isChecked = !allSelected && selectedIds.has(doc.id);
                return (
                  <button
                    key={doc.id}
                    id={`doc-select-${doc.id}`}
                    type="button"
                    onClick={() => isReady && onToggleDoc(doc.id)}
                    disabled={!isReady}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isReady
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${isChecked
                          ? "bg-blue-600 border-blue-600"
                          : isReady
                            ? "border-gray-300"
                            : "border-gray-200"
                        }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {fileIcon(doc.filename)}
                    <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                      {doc.filename}
                    </span>
                    {doc.status === "ready" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                    {doc.status === "processing" && (
                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    {doc.status === "failed" && (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Source Card ─────────────────────────────────────────────────────────────── */

/* ── Citation Helpers ──────────────────────────────────────────────────────── */

/**
 * Extract all citation numbers referenced in text like "[1]", "[2]‑[5]", "[1, 3]"
 */
function extractCitedNumbers(text: string): Set<number> {
  const cited = new Set<number>();
  const regex = /\[([0-9\s,\-‑–]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const inner = match[1];
    const parts = inner.split(/[,]+/);
    for (const part of parts) {
      const rangeMatch = part.trim().match(/^(\d+)\s*[-‑–]\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && end - start < 50) {
          for (let i = start; i <= end; i++) cited.add(i);
        }
      } else {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num)) cited.add(num);
      }
    }
  }
  return cited;
}

/**
 * Render answer text with interactive [n] citation buttons
 */
function FormattedAnswer({
  content,
  onCitationClick,
}: {
  content: string;
  onCitationClick: (num: number) => void;
}) {
  const citationRegex = /(\[[0-9\s,\-‑–]+\])/g;
  const segments = content.split(citationRegex);

  return (
    <>
      {segments.map((segment, idx) => {
        const match = segment.match(/^\[([0-9\s,\-‑–]+)\]$/);
        if (!match) {
          return <React.Fragment key={idx}>{segment}</React.Fragment>;
        }

        const inner = match[1].trim();
        // Single citation number like "[1]"
        if (/^\d+$/.test(inner)) {
          const num = parseInt(inner, 10);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onCitationClick(num)}
              className="inline-flex items-center justify-center font-sans text-xs font-semibold px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 transition-colors cursor-pointer align-baseline shadow-2xs"
              title={`Jump to source [${num}]`}
            >
              [{num}]
            </button>
          );
        }

        // Multiple citations or range like "[1, 2]" or "[2]‑[5]"
        const tokens = inner.split(/(\d+)/g);
        return (
          <span
            key={idx}
            className="inline-flex items-center mx-0.5 align-baseline text-xs font-sans"
          >
            <span className="text-gray-400 font-semibold">[</span>
            {tokens.map((token, tIdx) => {
              if (/^\d+$/.test(token)) {
                const num = parseInt(token, 10);
                return (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => onCitationClick(num)}
                    className="px-1 py-0.5 rounded font-semibold text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 transition-colors cursor-pointer"
                    title={`Jump to source [${num}]`}
                  >
                    {num}
                  </button>
                );
              }
              return (
                <span key={tIdx} className="text-gray-400 font-medium px-0.5">
                  {token}
                </span>
              );
            })}
            <span className="text-gray-400 font-semibold">]</span>
          </span>
        );
      })}
    </>
  );
}

/* ── Source Card ─────────────────────────────────────────────────────────────── */

interface SourceCardProps {
  source: Source;
  index: number;
  documents?: DocumentItem[];
  messageId: string;
  isHighlighted?: boolean;
}

function SourceCard({
  source,
  index,
  documents = [],
  messageId,
  isHighlighted = false,
}: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract source filename or identifier from backend fields
  const rawSource =
    (typeof source.source === "string" && source.source) ||
    (typeof source.filename === "string" && source.filename) ||
    (typeof source.document === "string" && source.document) ||
    (typeof source.document_name === "string" && source.document_name) ||
    (typeof source.name === "string" && source.name) ||
    "";

  // Match against known documents to display human-friendly filename
  const matchedDoc = documents.find((d) => {
    if (!rawSource) return false;
    if (d.filename.toLowerCase() === rawSource.toLowerCase()) return true;
    if (d.id === rawSource) return true;
    if (rawSource.startsWith(d.id)) return true;
    const strippedRaw = rawSource.replace(/\.[^/.]+$/, "");
    if (d.id === strippedRaw) return true;
    return false;
  });

  const displayFilename = matchedDoc?.filename || rawSource || "Unknown source";

  // Citation index number (e.g. backend sends { n: 1 })
  const citationNum = typeof source.n === "number" ? source.n : index + 1;

  // Page number
  const rawPage =
    source.page ??
    source.page_number ??
    (source.metadata && typeof source.metadata === "object"
      ? (source.metadata as Record<string, unknown>).page
      : undefined);
  const page =
    rawPage !== undefined && rawPage !== null && rawPage !== ""
      ? `p. ${rawPage}`
      : null;

  // Check for table type
  const isTable: boolean = Boolean(
    source.type === "table" ||
      source.chunk_type === "table" ||
      (source.metadata &&
        typeof source.metadata === "object" &&
        (source.metadata as Record<string, unknown>).type === "table")
  );

  // Passage excerpt (~200 characters)
  const fullText =
    (typeof source.content === "string" && source.content) ||
    (typeof source.text === "string" && source.text) ||
    (typeof source.chunk === "string" && source.chunk) ||
    "";

  const isLong = fullText.length > 200;
  const excerpt = isLong ? `${fullText.slice(0, 200).trim()}...` : fullText;

  return (
    <div
      id={`source-card-${messageId}-${citationNum}`}
      className={`p-3 rounded-xl border text-xs transition-all duration-300 ${
        isHighlighted
          ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400/50 shadow-md"
          : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] transition-colors ${
            isHighlighted
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {citationNum}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {fileIcon(displayFilename)}
            <span
              className="font-semibold text-gray-800 truncate max-w-[240px]"
              title={displayFilename}
            >
              {displayFilename}
            </span>

            {page && (
              <span className="text-gray-500 font-medium text-[11px] bg-white border border-gray-200 px-1.5 py-0.2 rounded">
                {page}
              </span>
            )}

            {isTable && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Table className="w-3 h-3 text-amber-600" />
                Table
              </span>
            )}
          </div>

          {fullText && (
            <div className="mt-2">
              <blockquote className="pl-2.5 border-l-2 border-slate-300 text-xs text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                &ldquo;{isExpanded ? fullText : excerpt}&rdquo;
              </blockquote>

              {isLong && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  {isExpanded ? "Show less" : "Show full passage"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Chat Bubble ────────────────────────────────────────────────────────────── */

function ChatMessage({
  message,
  documents = [],
}: {
  message: Message;
  documents?: DocumentItem[];
}) {
  const isUser = message.role === "user";
  const [highlightedNum, setHighlightedNum] = useState<number | null>(null);
  const [showOther, setShowOther] = useState(false);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse cited numbers from content
  const citedNumbers = React.useMemo(() => {
    return extractCitedNumbers(message.content);
  }, [message.content]);

  // Separate sources into cited and uncited
  const { citedSources, uncitedSources } = React.useMemo(() => {
    if (!message.sources || message.sources.length === 0) {
      return { citedSources: [], uncitedSources: [] };
    }
    const cited: Source[] = [];
    const uncited: Source[] = [];

    message.sources.forEach((src, idx) => {
      const num = typeof src.n === "number" ? src.n : idx + 1;
      if (citedNumbers.has(num)) {
        cited.push(src);
      } else {
        uncited.push(src);
      }
    });

    return { citedSources: cited, uncitedSources: uncited };
  }, [message.sources, citedNumbers]);

  const handleCitationClick = useCallback(
    (num: number) => {
      // If target card is in the uncited section, auto-expand it
      const isUncited = uncitedSources.some((src, idx) => {
        const n =
          typeof src.n === "number"
            ? src.n
            : message.sources!.indexOf(src) + 1;
        return n === num;
      });
      if (isUncited) {
        setShowOther(true);
      }

      setHighlightedNum(num);
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedNum(null);
      }, 2500);

      // Smooth scroll to card
      setTimeout(() => {
        const el = document.getElementById(
          `source-card-${message.id}-${num}`
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 60);
    },
    [message.id, message.sources, uncitedSources]
  );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] flex flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
              : message.isError
                ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-sm"
                : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-xs"
          }`}
        >
          {message.isError && (
            <div className="flex items-center gap-1.5 mb-1.5 font-semibold text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Error</span>
            </div>
          )}
          {isUser || message.isError ? (
            message.content
          ) : (
            <FormattedAnswer
              content={message.content}
              onCitationClick={handleCitationClick}
            />
          )}
        </div>

        {/* Sources list */}
        {message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            {/* Cited Sources */}
            {citedSources.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Cited Sources ({citedSources.length})
                </p>
                {citedSources.map((src, i) => {
                  const citationNum =
                    typeof src.n === "number"
                      ? src.n
                      : message.sources!.indexOf(src) + 1;
                  return (
                    <SourceCard
                      key={`cited-${i}`}
                      source={src}
                      index={message.sources!.indexOf(src)}
                      documents={documents}
                      messageId={message.id}
                      isHighlighted={highlightedNum === citationNum}
                    />
                  );
                })}
              </div>
            )}

            {/* If no sources were cited explicitly in answer text, show all in other/sources */}
            {citedSources.length === 0 && uncitedSources.length === 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Sources
                </p>
                {message.sources.map((src, i) => (
                  <SourceCard
                    key={i}
                    source={src}
                    index={i}
                    documents={documents}
                    messageId={message.id}
                    isHighlighted={
                      highlightedNum ===
                      (typeof src.n === "number" ? src.n : i + 1)
                    }
                  />
                ))}
              </div>
            )}

            {/* Uncited sources in collapsed section */}
            {uncitedSources.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOther((prev) => !prev)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-medium text-gray-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      Other retrieved passages ({uncitedSources.length})
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      showOther ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showOther && (
                  <div className="mt-2 space-y-2">
                    {uncitedSources.map((src, i) => {
                      const citationNum =
                        typeof src.n === "number"
                          ? src.n
                          : message.sources!.indexOf(src) + 1;
                      return (
                        <SourceCard
                          key={`uncited-${i}`}
                          source={src}
                          index={message.sources!.indexOf(src)}
                          documents={documents}
                          messageId={message.id}
                          isHighlighted={highlightedNum === citationNum}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center ml-2.5 mt-0.5 flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      )}
    </div>
  );
}

/* ── Main Chat Page ─────────────────────────────────────────────────────────── */

export default function ChatPage() {
  /* Document selector state */
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDocsError, setIsDocsError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(true);

  /* Chat state */
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Fetch documents ─────────────────────────────────────────────────────── */
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    setIsDocsError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/documents`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch {
      setIsDocsError(true);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingDocs(true);
      setIsDocsError(false);
      try {
        const res = await fetch(`${API_BASE_URL}/documents`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setDocuments(data);
      } catch {
        if (!cancelled) setIsDocsError(true);
      } finally {
        if (!cancelled) setIsLoadingDocs(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Auto-scroll to latest message ───────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Auto-resize textarea ────────────────────────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [question]);

  /* ── Document toggle handlers ────────────────────────────────────────────── */
  const handleToggleAll = () => {
    setAllSelected(true);
    setSelectedIds(new Set());
  };

  const handleToggleDoc = (id: string) => {
    setAllSelected(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) setAllSelected(true);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ── Scope indicator text ────────────────────────────────────────────────── */
  const readyDocs = documents.filter((d) => d.status === "ready");
  const scopeText = allSelected
    ? "Searching all documents"
    : selectedIds.size === 1
      ? "Searching 1 document"
      : `Searching ${selectedIds.size} documents`;

  /* ── Submit question ─────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const q = question.trim();
    if (!q || isAsking) return;

    // Build source_filenames from selected document IDs
    // The backend stores chunks in Qdrant and BM25 using UUID filenames (e.g. {id}.pdf or {id})
    // while the user UI displays doc.filename. We include all possible variants (filename, id, id.ext)
    // so the backend's Qdrant 'should' filter and BM25 'in set' filter match the selected document.
    let sourceFilenames: string[] | undefined;
    if (!allSelected && selectedIds.size > 0) {
      const selectedDocs = documents.filter((d) => selectedIds.has(d.id));
      const names = new Set<string>();
      selectedDocs.forEach((d) => {
        if (d.filename) names.add(d.filename);
        if (d.id) {
          names.add(d.id);
          const ext = d.filename?.split(".").pop();
          if (ext) {
            names.add(`${d.id}.${ext}`);
          }
          names.add(`${d.id}.pdf`);
        }
      });
      sourceFilenames = Array.from(names);
    }

    const userMsg: Message = { id: uid(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setIsAsking(true);

    try {
      const body: Record<string, unknown> = { question: q, k: 5 };
      if (sourceFilenames && sourceFilenames.length > 0) {
        body.source_filenames = sourceFilenames;
      }

      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let detail = `Request failed (status ${res.status})`;
        try {
          const err = await res.json();
          if (err.detail)
            detail =
              typeof err.detail === "string"
                ? err.detail
                : JSON.stringify(err.detail);
        } catch {
          /* ignore parse error */
        }
        throw new Error(detail);
      }

      const data = await res.json();

      const answer: string =
        data.answer ?? data.response ?? data.text ?? JSON.stringify(data);

      const sources: Source[] = Array.isArray(data.sources)
        ? data.sources
        : Array.isArray(data.source_documents)
          ? data.source_documents
          : [];

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: answer, sources },
      ]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to connect to the backend.";
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: errMsg, isError: true },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <Breadcrumbs current="Chat" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            AI Chat
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Ask questions across your indexed knowledge base
          </p>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="flex flex-col bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
      >
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Start a conversation
                </h3>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                  Ask any question about your uploaded documents. Use the
                  document selector below to narrow the search scope.
                </p>
              </div>
              {readyDocs.length === 0 && !isLoadingDocs && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No ready documents yet.{" "}
                    <a
                      href="/knowledge-base"
                      className="underline font-semibold"
                    >
                      Upload documents
                    </a>{" "}
                    first.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} documents={documents} />
          ))}

          {/* Typing indicator */}
          {isAsking && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2.5 flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-100 px-4 py-4 bg-slate-50/50">
          {/* Scope indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 pl-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span id="scope-indicator">
              {isLoadingDocs ? "Loading documents…" : scopeText}
            </span>
          </div>

          <div className="flex items-end gap-3">
            {/* Document selector */}
            <DocumentSelector
              documents={documents}
              selectedIds={selectedIds}
              allSelected={allSelected}
              onToggleAll={handleToggleAll}
              onToggleDoc={handleToggleDoc}
              isLoading={isLoadingDocs}
              isError={isDocsError}
              onRefresh={fetchDocuments}
            />

            {/* Text input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                id="chat-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAsking}
                placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="w-full resize-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all disabled:opacity-60 shadow-xs"
              />
            </div>

            {/* Send */}
            <button
              id="chat-submit"
              type="button"
              onClick={handleSubmit}
              disabled={!question.trim() || isAsking}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md shadow-blue-100 disabled:shadow-none active:scale-95 cursor-pointer"
              title="Send message"
            >
              {isAsking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
