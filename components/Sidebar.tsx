"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  Key,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  id: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    id: "nav-dashboard",
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: Database,
    id: "nav-knowledge-base",
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    id: "nav-chat",
  },
  {
    name: "API Keys",
    href: "/api-keys",
    icon: Key,
    id: "nav-api-keys",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Toggle Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            <div className="w-2 h-2 bg-red-400 rounded-sm" />
            <div className="w-2 h-2 bg-green-400 rounded-sm" />
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            <div className="w-2 h-2 bg-yellow-400 rounded-sm" />
          </div>
          <span className="font-bold text-gray-900 text-lg">RAG Web UI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-40 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } top-0 left-0`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="flex gap-0.5">
            <div className="w-2 h-2 bg-red-400 rounded-sm" />
            <div className="w-2 h-2 bg-green-400 rounded-sm" />
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            <div className="w-2 h-2 bg-yellow-400 rounded-sm" />
          </div>
          <span className="font-bold text-gray-900 text-lg">RAG Web UI</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "sidebar-item-active"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="text-xl w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <Link
            href="/auth/signout"
            id="btn-signout"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="text-xl w-5 h-5 shrink-0" />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
