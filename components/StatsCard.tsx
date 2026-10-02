import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatsCardProps {
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
  count: number | string;
  label: string;
  linkHref: string;
  linkLabel: string;
  id: string;
}

export function StatsCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  count,
  label,
  linkHref,
  linkLabel,
  id,
}: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-between">
      <div className="flex items-center gap-6 mb-6">
        <div className={`w-14 h-14 rounded-full ${iconBgClass} flex items-center justify-center shrink-0`}>
          <Icon className={`w-7 h-7 ${iconColorClass}`} />
        </div>
        <div>
          <div className="text-4xl font-bold text-gray-900">{count}</div>
          <div className="text-gray-500 font-medium">{label}</div>
        </div>
      </div>
      <Link
        href={linkHref}
        id={id}
        className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline group"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
