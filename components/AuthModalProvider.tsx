"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthModal } from "@/components/AuthModal";

type OpenAuthOptions = {
  callbackURL?: string;
  titleOverride?: string;
  onBeforeGoogleSignIn?: () => void;
  onClose?: () => void;
};

type AuthModalContextValue = {
  openAuthModal: (options?: OpenAuthOptions) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [callbackURL, setCallbackURL] = useState<string>("/");
  const [titleOverride, setTitleOverride] = useState<string | undefined>(
    undefined,
  );
  const [onBeforeGoogleSignIn, setOnBeforeGoogleSignIn] = useState<
    (() => void) | undefined
  >(undefined);
  const [onCloseAction, setOnCloseAction] = useState<(() => void) | undefined>(
    undefined,
  );

  const closeAuthModal = useCallback(() => {
    setOpen(false);
    onCloseAction?.();
  }, [onCloseAction]);

  const openAuthModal = useCallback((options?: OpenAuthOptions) => {
    setCallbackURL(options?.callbackURL ?? "/");
    setTitleOverride(options?.titleOverride);
    setOnBeforeGoogleSignIn(() => options?.onBeforeGoogleSignIn);
    setOnCloseAction(() => options?.onClose);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onClose={closeAuthModal}
        callbackURL={callbackURL}
        titleOverride={titleOverride}
        onBeforeGoogleSignIn={onBeforeGoogleSignIn}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used inside AuthModalProvider");
  }
  return ctx;
}
