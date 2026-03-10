"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

// Re-usable base class for every dropdown nav item (Link + button)
const navLinkBase =
  "text-sm font-medium text-foreground no-underline bg-transparent" +
  "cursor-pointer text-left font-[inherit] tracking-normal transition-colors " +
  "duration-150 leading-none";

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
  const admin = user?.role === "admin";
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
    <header className="fixed top-0 left-0 right-0 z-200 p-8 flex justify-end items-center pointer-events-none">
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
            className="absolute -top-6 -right-6 bg-white rounded-[1.25rem] shadow-[0_2px_100px_rgba(0,0,0,0.10)] min-w-70 max-w-75 p-6 flex items-start gap-4 z-300"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col gap-4 w-full overflow-hidden">
              {/* User info row */}
              {user && (
                <div className="relative flex items-center gap-2">
                  <div className="size-10 rounded-full bg-[#ddd] overflow-hidden flex items-center justify-center shrink-0">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name ?? "avatar"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[0.75rem] font-semibold text-muted">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex-col gap-1.25 flex">
                    <p className="font-medium text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-sm opacity-50 truncate line-clamp-1 overflow-hidden">
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="gap-25 flex flex-col">
                {/* Nav links */}
                <nav className="flex flex-col gap-4">

                  {!user && (
                    <>
                      <Link
                        href="/login"
                        className={cn(navLinkBase)}
                        onClick={close}
                      >
                        Login
                      </Link>
                      <Link
                        href="/login"
                        className={cn(navLinkBase)}
                        onClick={close}
                      >
                        Create an Account
                      </Link>
                    </>
                  )}
                  <Link
                    href="/submit"
                    className={cn(navLinkBase)}
                    onClick={close}
                  >
                    Submit a Quotes
                  </Link>

                  {!isPending && user && (
                    <>
                      {admin ? (
                        <Link
                        href="/dashboard"
                        className={cn(navLinkBase)}
                        onClick={close}
                      >
                        Dashboard
                      </Link>
                      ) :
                      <Link
                        href="/your-quotes"
                        className={cn(navLinkBase)}
                        onClick={close}
                      >
                        Your Quotes
                      </Link>
                      }
                      
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
                </nav>

                {/* Footer links */}
                <div className="flex flex-col gap-4">
                  <Link
                    href="/privacy"
                    className={cn(navLinkBase)}
                    onClick={close}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className={cn(navLinkBase)}
                    onClick={close}
                  >
                    Terms &amp; Conditions
                  </Link>
                </div>
              </div>
            </div>
            <button
              className="bg-transparent border-0 cursor-pointer text-foreground flex items-center shrink-0"
              onClick={close}
              aria-label="Close menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
