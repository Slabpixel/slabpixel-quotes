"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { useAuthModal } from "@/components/AuthModalProvider";
import { useSubmitQuoteModal } from "@/components/SubmitQuoteModalProvider";

// Re-usable base class for every dropdown nav item (Link + button)
const navLinkBase =
  "text-sm font-medium text-foreground no-underline bg-transparent " +
  "cursor-pointer text-left font-[inherit] tracking-normal transition-colors " +
  "duration-150 leading-none";

// Custom hamburger icon (two unequal lines)
function HamburgerIcon({ hovered }: { hovered: boolean }) {
  const topLineRef = useRef<SVGLineElement | null>(null);
  const bottomLineRef = useRef<SVGLineElement | null>(null);

  useEffect(() => {
    if (!topLineRef.current || !bottomLineRef.current) return;
    gsap.to(topLineRef.current, {
      attr: { x1: hovered ? 1 : 17 },
      duration: 0.28,
      ease: "power2.out",
    });
    gsap.to(bottomLineRef.current, {
      attr: { x1: hovered ? 17 : 1 },
      duration: 0.28,
      ease: "power2.out",
    });
  }, [hovered]);

  return (
    <svg
      width="34"
      height="10"
      viewBox="0 0 34 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        ref={bottomLineRef}
        x1="1"
        y1="9"
        x2="33"
        y2="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        ref={topLineRef}
        x1="17"
        y1="1"
        x2="33"
        y2="1"
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
  const [isHamburgerHovered, setIsHamburgerHovered] = useState(false);
  const [isMenuHamburgerHovered, setIsMenuHamburgerHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useAuthModal();
  const { openSubmitModal } = useSubmitQuoteModal();

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
    <>
      <header className="fixed top-0 left-0 right-0 z-200 p-8 flex justify-end items-center pointer-events-none">
        <div className="relative pointer-events-auto" ref={menuRef}>
        {/* Hamburger toggle */}
        <button
          className="bg-transparent border-0 cursor-pointer text-foreground flex items-center leading-none"
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => setIsHamburgerHovered(true)}
          onMouseLeave={() => setIsHamburgerHovered(false)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <HamburgerIcon hovered={isHamburgerHovered} />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className="absolute -top-6 -right-6 bg-white rounded-[1.25rem] shadow-[0_2px_100px_rgba(0,0,0,0.10)] min-w-70 max-w-75 p-6 flex items-start gap-4 z-300"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col gap-4 w-full overflow-hidden">
              {/* User info row — click goes to profile */}
              {user && (
                <Link
                  href={`/profile/${user.id}`}
                  onClick={close}
                  className="relative flex items-center gap-2 no-underline text-foreground hover:opacity-90 transition-opacity rounded-lg -mx-1 px-1 py-0.5"
                >
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
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="font-medium text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-sm opacity-50 truncate line-clamp-1 overflow-hidden">
                      {user?.email}
                    </p>
                  </div>
                </Link>
              )}

              <div className="gap-25 flex flex-col">
                {/* Nav links */}
                <nav className="flex flex-col gap-4">

                  {!user && (
                    <>
                      <button
                        type="button"
                        className={cn(navLinkBase)}
                        onClick={() => {
                          close();
                          openAuthModal({ callbackURL: "/" });
                        }}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        className={cn(navLinkBase)}
                        onClick={() => {
                          close();
                          openAuthModal({ callbackURL: "/" });
                        }}
                      >
                        Create an Account
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className={cn(navLinkBase)}
                    onClick={() => {
                      close();
                      openSubmitModal();
                    }}
                  >
                    Submit a Quotes
                  </button>

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
                      ) : (
                        <Link
                          href="/your-quotes"
                          className={cn(navLinkBase)}
                          onClick={close}
                        >
                          Your Quotes
                        </Link>
                      )}
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
              onMouseEnter={() => setIsMenuHamburgerHovered(true)}
              onMouseLeave={() => setIsMenuHamburgerHovered(false)}
              aria-label="Close menu"
            >
              <HamburgerIcon hovered={isMenuHamburgerHovered} />
            </button>
          </div>
        )}
        </div>
      </header>
    </>
  );
}
