import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = ["/your-quotes", "/dashboard"];
const adminPaths = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, we can't check the role in middleware without a DB call.
  // The admin API routes handle role checks server-side.
  // For admin pages, the page component itself will verify the role.

  return NextResponse.next();
}

export const config = {
  matcher: ["/your-quotes/:path*", "/dashboard/:path*"],
};
