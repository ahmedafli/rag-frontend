import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  current: string;
}

export function Breadcrumbs({ current }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-gray-600 transition-colors flex items-center">
        <Home className="text-lg w-4 h-4" />
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-300" />
      <span className="text-gray-900 font-medium">{current}</span>
    </nav>
  );
}
