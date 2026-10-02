import React from "react";
import Link from "next/link";

interface QuickActionCardProps {
  id: string;
  href: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
  hoverBorderClass: string;
  hoverShadowClass: string;
  title: string;
  description: string;
}

export function QuickActionCard({
  id,
  href,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  hoverBorderClass,
  hoverShadowClass,
  title,
  description,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      id={id}
      className={`group block bg-white border border-gray-100 rounded-3xl p-8 text-center transition-all ${hoverBorderClass} hover:shadow-xl ${hoverShadowClass}`}
    >
      <div
        className={`w-16 h-16 rounded-full ${iconBgClass} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-8 h-8 ${iconColorClass}`} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </Link>
  );
}
