"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SubmitQuoteModal } from "./SubmitQuoteModal";
import { useLenis } from "lenis/react";

type SubmitQuoteModalContextValue = {
  isOpen: boolean;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
};

const SubmitQuoteModalContext =
  createContext<SubmitQuoteModalContextValue | null>(null);

export function SubmitQuoteModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lenis = useLenis();

  const shouldAutoOpen =
    pathname !== "/submit" && searchParams.get("submit") === "1";

  const [isOpen, setIsOpen] = useState(shouldAutoOpen);

  const removeSubmitFlagFromURL = useCallback(() => {
    if (typeof window === "undefined") return;
    if (searchParams.get("submit") !== "1") return;

    const url = new URL(window.location.href);
    url.searchParams.delete("submit");
    const nextSearch = url.searchParams.toString();
    const next =
      `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash || ""}`;

    router.replace(next, { scroll: false });
  }, [router, searchParams]);

  // If we just came back from OAuth with ?submit=1, open the modal and then clean the URL.
  useEffect(() => {
    if (!shouldAutoOpen) return;
    removeSubmitFlagFromURL();
  }, [removeSubmitFlagFromURL, shouldAutoOpen]);

  // Prevent background scroll while modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Ensure Lenis doesn't hijack wheel/scroll while the modal is open.
  useEffect(() => {
    if (!lenis) return;
    if (isOpen) lenis.stop();
    else lenis.start();
  }, [isOpen, lenis]);

  const openSubmitModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSubmitModal = useCallback(() => {
    setIsOpen(false);
    removeSubmitFlagFromURL();
  }, [removeSubmitFlagFromURL]);

  const value = useMemo(
    () => ({ isOpen, openSubmitModal, closeSubmitModal }),
    [closeSubmitModal, isOpen, openSubmitModal],
  );

  return (
    <SubmitQuoteModalContext.Provider value={value}>
      {children}
      {isOpen && <SubmitQuoteModal onClose={closeSubmitModal} />}
    </SubmitQuoteModalContext.Provider>
  );
}

export function useSubmitQuoteModal() {
  const ctx = useContext(SubmitQuoteModalContext);
  if (!ctx) {
    throw new Error(
      "useSubmitQuoteModal must be used inside SubmitQuoteModalProvider",
    );
  }
  return ctx;
}

