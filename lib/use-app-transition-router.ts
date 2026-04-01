"use client";

import { useTransitionRouter } from "next-view-transitions";
import { slideInOutTransition } from "@/lib/view-transition";

export function useAppTransitionRouter() {
  const router = useTransitionRouter();

  const push = (href: string, options?: { scroll?: boolean }) => {
    router.push(href, { ...options, onTransitionReady: slideInOutTransition });
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    router.replace(href, { ...options, onTransitionReady: slideInOutTransition });
  };

  return {
    ...router,
    push,
    replace,
  };
}
