"use client";

import { STATUS_COLORS } from "@/lib/constants/quote-status";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/** Reusable status badge with consistent colors. */
export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? "#999";
  return (
    <span
      className={`text-[0.65rem] uppercase tracking-widest font-medium px-2 py-1 rounded-full ${className}`}
      style={{
        color,
        backgroundColor: `${color}12`,
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}
