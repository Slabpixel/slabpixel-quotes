"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

// Re-usable base class for every dropdown nav item (Link + button)
const navLinkBase =
  "text-base font-normal text-foreground no-underline py-[0.6rem] bg-transparent " +
  "border-0 cursor-pointer text-left font-[inherit] tracking-normal transition-colors " +
  "duration-150 leading-snug hover:text-accent";

// Custom hamburger icon (two unequal lines)
function HamburgerIcon() {
  return (
    <svg
      width="34"
      height="10"
      viewBox="0 0 34 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M33 9H1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33 1H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] p-8 flex justify-end items-center pointer-events-none">
      <div className="relative pointer-events-auto" ref={menuRef}>
        {/* Hamburger toggle */}
        <button
          className="bg-transparent border-0 cursor-pointer text-foreground flex items-center leading-none"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <HamburgerIcon />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className="absolute top-[-1.5rem] right-[-1.5rem] bg-white rounded-[1.25rem] shadow-[0_2px_100px_rgba(0,0,0,0.10)] min-w-[280px] p-6 flex flex-col z-[300] animate-[dropdown-in_0.18s_ease]"
            role="dialog"
            aria-modal="true"
          >
            {/* User info row */}
            <div className="relative flex items-center gap-3 pb-5 border-b border-border mb-1">
              <div className="w-11 h-11 rounded-full bg-[#ddd] overflow-hidden flex items-center justify-center shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "avatar"}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[0.75rem] font-semibold text-muted">
                    {initials}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-semibold text-foreground m-0 leading-[1.3]">
                  {user?.name ?? "Guest"}
                </p>
                {user?.email && (
                  <p className="text-[0.72rem] text-muted m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                    {user.email.length > 22
                      ? user.email.slice(0, 22) + "…"
                      : user.email}
                  </p>
                )}
              </div>

              {/* Close — same icon, top-right corner of panel */}
              <button
                className="bg-transparent border-0 cursor-pointer text-foreground flex items-center shrink-0 absolute top-0 right-0"
                onClick={close}
                aria-label="Close menu"
              >
                <HamburgerIcon />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col py-2">
              <Link href="/submit" className={cn(navLinkBase)} onClick={close}>
                Submit a Quotes
              </Link>

              {!isPending && user && (
                <>
                  {(user as { role?: string }).role === "admin" && (
                    <Link
                      href="/admin"
                      className={cn(navLinkBase)}
                      onClick={close}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className={cn(navLinkBase)}
                    onClick={close}
                  >
                    Dashboard
                  </Link>
                  <button
                    className={cn(navLinkBase, "block w-full")}
                    onClick={() => {
                      signOut();
                      close();
                    }}
                  >
                    Log out
                  </button>
                </>
              )}

              {!isPending && !user && (
                <Link
                  href="/sign-in"
                  className={cn(navLinkBase)}
                  onClick={close}
                >
                  Sign In
                </Link>
              )}
            </nav>

            {/* Footer links */}
            <div className="flex flex-col gap-[0.35rem] pt-5 border-t border-border mt-2">
              <Link
                href="/privacy"
                className="text-[0.8rem] text-muted no-underline transition-colors duration-150 hover:text-foreground"
                onClick={close}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[0.8rem] text-muted no-underline transition-colors duration-150 hover:text-foreground"
                onClick={close}
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
