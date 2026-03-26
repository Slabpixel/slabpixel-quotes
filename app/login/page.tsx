"use client";

import { useAuthModal } from "@/components/AuthModalProvider";
import { BackToHome } from "@/components/BackToHome";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    openAuthModal({
      callbackURL: callbackUrl,
      onClose: () => router.replace(callbackUrl),
    });
  }, [callbackUrl, openAuthModal, router]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackToHome />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-foreground/50">Loading...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
