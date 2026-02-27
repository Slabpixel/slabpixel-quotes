"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "@/lib/auth-client";

export default function SiteHeader() {
  const { data: session, isPending } = useSession();

  return (
    <header className="site-header">
      <Link href="/" className="site-header__logo">
        SlabPixel Quotes
      </Link>

      <nav className="site-header__nav">
        <Link href="/submit" className="site-header__link">
          Submit
        </Link>

        {isPending ? null : session ? (
          <>
            {session.user.role === "admin" && (
              <Link href="/admin" className="site-header__link">
                Admin
              </Link>
            )}
            <Link href="/dashboard" className="site-header__link">
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="site-header__link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/sign-in" className="site-header__link">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
