"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, signUp } from "@/lib/auth-client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  callbackURL?: string;
  titleOverride?: string;
  onBeforeGoogleSignIn?: () => void;
}

export function AuthModal({
  open,
  onClose,
  callbackURL = "/",
  titleOverride,
  onBeforeGoogleSignIn,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      onBeforeGoogleSignIn?.();
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign in failed. Please try again.",
      );
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const result = await signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
      } else {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Password confirmation does not match.");
        }
        const result = await signUp.email({
          email,
          password,
          name: email.split("@")[0] || "User",
        });
        if (result.error) throw new Error(result.error.message);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-3xl p-4 w-full max-w-[340px]">
        <div className="text-center mb-4">
          <h2 className="text-xl text-foreground">
            {titleOverride ??
              (mode === "login" ? "Login" : "Create an Account")}
          </h2>
          <p className="text-sm text-foreground/50 mt-2 leading-none">
            {mode === "login"
              ? "Sign in to create your quotes"
              : "Sign up to create an account"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground p-3.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.0625 9.92188C19.0625 15.4297 15.2734 19.375 9.6875 19.375C4.33594 19.375 0 15.0391 0 9.6875C0 4.33594 4.33594 0 9.6875 0C12.3047 0 14.4922 0.976562 16.1719 2.53906L13.5547 5.07812C10.1172 1.75781 3.67188 4.25781 3.67188 9.6875C3.67188 13.0859 6.36719 15.8203 9.6875 15.8203C13.5156 15.8203 14.9609 13.0469 15.1953 11.6406H9.6875V8.28125H18.9062C18.9844 8.78906 19.0625 9.25781 19.0625 9.92188Z"
              fill="white"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-foreground/40">
            {mode === "login"
              ? "or continue with"
              : "or create an account with"}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-2">
          <div>
            <label className="block text-sm text-foreground/60 mb-0.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email address"
              className="w-full border bg-input border-input-border h-12 rounded-lg p-3.5 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground/60 mb-0.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              className="w-full border bg-input border-input-border h-12 rounded-lg p-3.5 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/20"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm text-foreground/60 mb-0.5">
                Password Confirmation
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="w-full border bg-input border-input-border h-12 rounded-lg p-3.5 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/20"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50 mt-2">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-foreground font-medium underline cursor-pointer bg-transparent border-0"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-foreground font-medium underline cursor-pointer bg-transparent border-0"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
