"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { QuoteData } from "@/types/quote";
import {
  SHARE_PLATFORMS,
  type SharePlatform,
} from "@/lib/constants/share-platforms";
import {
  generateShareCardBlob,
  type ShareCardProgressStep,
} from "@/lib/share-card-canvas";

interface QuoteShareMenuProps {
  quote: QuoteData;
}

export function QuoteShareMenu({ quote }: QuoteShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [progress, setProgress] = useState<ShareCardProgressStep | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<SharePlatform | null>(
    null,
  );
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleGenerate = async (platform: SharePlatform) => {
    setStatus("loading");
    setProgress("start");
    setOpen(false);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const blob = await generateShareCardBlob(quote, platform, origin, (step) =>
        setProgress(step),
      );
      const url = URL.createObjectURL(blob);

      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      setShareBlob(blob);
      setImageUrl(url);
      setCurrentPlatform(platform);
      setModalOpen(true);
      setStatus("idle");
      setProgress(null);
    } catch (e) {
      setStatus("error");
      setProgress(null);
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleShareNow = async () => {
    if (!shareBlob || !currentPlatform) return;

    try {
      const file = new File([shareBlob], `quote-${currentPlatform}.png`, {
        type: "image/png",
      });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: quote.attribution,
          text: quote.text,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(shareBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quote-${currentPlatform}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleDownload = () => {
    if (!shareBlob || !currentPlatform) return;

    const url = URL.createObjectURL(shareBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote-${currentPlatform}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleChangePlatform = () => {
    setModalOpen(false);
    setOpen(true);
  };

  const platforms = Object.entries(SHARE_PLATFORMS) as [
    SharePlatform,
    (typeof SHARE_PLATFORMS)[SharePlatform],
  ][];

  const progressPercent =
    progress === "start"
      ? 10
      : progress === "background"
        ? 35
        : progress === "font"
          ? 55
          : progress === "layout"
            ? 75
            : progress === "encode"
              ? 90
              : 0;

  return (
    <div className="relative inline-flex font-sans" ref={menuRef}>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 font-medium font-sans text-sm text-foreground bg-[#F8F8F8] border-0 rounded-full px-4 py-3 leading-none cursor-pointer transition-colors hover:bg-[#e4e4e4] disabled:opacity-60"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.7461 0.246094L14.4648 3.96484C14.7109 4.21094 14.7109 4.64844 14.4648 4.89453L10.7461 8.61328C10.5547 8.80469 10.2539 8.85938 10.0078 8.75C9.76172 8.64062 9.625 8.42188 9.625 8.14844V6.61719H8.33984C7.35547 6.61719 6.5625 7.41016 6.5625 8.39453C6.5625 8.72266 6.61719 8.96875 6.72656 9.13281C6.89062 9.40625 6.83594 9.73438 6.61719 9.95312C6.37109 10.1719 6.04297 10.1719 5.76953 10.0078C5.57812 9.84375 5.33203 9.67969 5.11328 9.43359C4.48438 8.80469 3.9375 7.90234 3.9375 6.61719C3.9375 4.21094 5.87891 2.24219 8.3125 2.24219H9.625V0.710938C9.625 0.4375 9.76172 0.21875 10.0078 0.109375C10.2539 0 10.5547 0.0546875 10.7461 0.246094ZM10.9375 2.89844C10.9375 3.25391 10.6367 3.55469 10.2812 3.55469H8.3125C6.61719 3.55469 5.25 4.92188 5.25 6.61719C5.25 6.94531 5.27734 7.21875 5.38672 7.49219C5.76953 6.23438 6.94531 5.30469 8.33984 5.30469H10.2812C10.6367 5.30469 10.9375 5.60547 10.9375 5.96094V6.5625L13.0703 4.42969L10.9375 2.29688V2.89844ZM2.1875 2.67969H2.84375C3.19922 2.67969 3.5 2.98047 3.5 3.33594C3.5 3.69141 3.19922 3.99219 2.84375 3.99219H2.1875C1.69531 3.99219 1.3125 4.375 1.3125 4.86719V11.8672C1.3125 12.3594 1.69531 12.7422 2.1875 12.7422H9.1875C9.65234 12.7422 10.0625 12.3594 10.0625 11.8672V11.2109C10.0625 10.8555 10.3359 10.5547 10.7188 10.5547C11.0742 10.5547 11.375 10.8555 11.375 11.2109V11.8672C11.375 13.0703 10.3906 14.0547 9.1875 14.0547H2.1875C0.957031 14.0547 0 13.0703 0 11.8672V4.86719C0 3.66406 0.957031 2.67969 2.1875 2.67969Z" fill="currentColor" />
          </svg>
          {status === "loading"
            ? progress === "background"
              ? "Loading background…"
              : progress === "font"
                ? "Loading fonts…"
                : progress === "layout"
                  ? "Laying out text…"
                  : progress === "encode"
                    ? "Preparing image…"
                    : "Generating…"
            : status === "error"
              ? "Failed"
              : "Share Quotes"}
        </button>
        {status === "loading" && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-50 min-w-48 rounded-2xl bg-white shadow-[0_12px_45px_rgba(0,0,0,0.10)] border border-black/5 py-2">
          {platforms.map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleGenerate(key)}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-[#f5f5f5] cursor-pointer transition-colors"
            >
              {cfg.label}
            </button>
          ))}
        </div>
      )}

      {modalOpen &&
        imageUrl &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-md rounded-3xl bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">
                  Share preview
                  {currentPlatform && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({SHARE_PLATFORMS[currentPlatform].label})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-black/10 bg-white text-xs text-foreground/70 hover:bg-black/5"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-black/5 bg-[#f5f5f5] p-3">
                <div className="relative w-full overflow-hidden rounded-xl bg-black/5">
                  <img
                    src={imageUrl}
                    alt="Generated share image preview"
                    className="h-auto w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleShareNow}
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/90 disabled:opacity-60"
                  >
                    Share now
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-foreground hover:bg-black/5"
                  >
                    Download
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleChangePlatform}
                  className="text-xs font-medium text-foreground/70 hover:text-foreground"
                >
                  Change social options
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
