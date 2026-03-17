"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const iconClass =
  "inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F8F8F8] border-0 no-underline text-foreground transition-colors hover:bg-[#e4e4e4] fixed top-8 left-8 z-100";

export function BackToHome({
  className,
}: {
  className?: string;
} = {}) {
  return (
    <Link
      href="/"
      className={cn(iconClass, className)}
      aria-label="Back to home"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M10 12L6 8l4-4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
