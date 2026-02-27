"use client";

import type { ReactElement } from "react";

/**
 * Detects platform from a social media URL/handle and returns the appropriate SVG icon.
 * Renders as a clickable link when the handle is a URL.
 * Supports: X/Twitter, Instagram, TikTok, YouTube, Threads, Bluesky, LinkedIn, GitHub, Mastodon
 */

type Platform =
  | "x"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "threads"
  | "bluesky"
  | "linkedin"
  | "github"
  | "mastodon"
  | "generic";

export function detectPlatform(handle: string): Platform {
  const h = handle.toLowerCase().trim();

  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
  if (h.includes("threads.net")) return "threads";
  if (
    h.includes("bsky.app") ||
    h.includes("bsky.social") ||
    h.includes("bluesky.social")
  )
    return "bluesky";
  if (h.includes("linkedin.com")) return "linkedin";
  if (h.includes("github.com")) return "github";
  if (
    h.includes("mastodon.social") ||
    h.includes("mastodon.online") ||
    h.includes("mstdn.")
  )
    return "mastodon";
  if (h.includes("twitter.com") || h.includes("x.com")) return "x";

  return "generic";
}

/** Extract a display name from a social media URL (e.g. "https://x.com/elonmusk" → "@elonmusk") */
export function extractDisplayName(handle: string): string {
  const h = handle.trim();

  try {
    const url = new URL(h);
    const path = url.pathname.replace(/\/+$/, ""); // strip trailing slashes
    const segments = path.split("/").filter(Boolean);

    // For most platforms the username is the first path segment
    // e.g. https://x.com/elonmusk → elonmusk
    // e.g. https://instagram.com/natgeo → natgeo
    // e.g. https://github.com/vercel → vercel
    // For youtube.com/@channel or youtube.com/c/channel
    if (segments.length > 0) {
      let username = segments[0];
      // Handle youtube /c/ or /channel/ paths
      if (
        (username === "c" || username === "channel" || username === "in") &&
        segments[1]
      ) {
        username = segments[1];
      }
      // Strip leading @ if present
      username = username.replace(/^@/, "");
      return `@${username}`;
    }
  } catch {
    // Not a valid URL — just return cleaned handle
  }

  // Fallback: if it starts with @, return as-is; otherwise prefix with @
  if (h.startsWith("@")) return h;
  return h;
}

/** Check if the handle is a URL (clickable) */
function isUrl(handle: string): boolean {
  return /^https?:\/\//i.test(handle.trim());
}

const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  bluesky: "Bluesky",
  linkedin: "LinkedIn",
  github: "GitHub",
  mastodon: "Mastodon",
  generic: "Link",
};

const ICONS: Record<
  Platform,
  (props: { size: number; color: string }) => ReactElement
> = {
  x: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: ({ size, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
    </svg>
  ),
  tiktok: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.85 4.85 0 01-3.77-1.55V6.69h3.77z" />
    </svg>
  ),
  youtube: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  threads: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.476C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.34-.779-.963-1.4-1.785-1.817a8.71 8.71 0 01-.292 2.056c-.497 1.593-1.452 2.51-2.755 2.647-.783.082-1.582-.1-2.25-.514-.744-.46-1.26-1.173-1.453-2.011-.383-1.665.493-3.197 2.287-4.002.948-.425 2.04-.608 3.26-.548.223-.89.084-1.703-.398-2.196-.572-.586-1.568-.723-2.457-.377a2.54 2.54 0 00-1.14.935l-1.69-1.181c.52-.743 1.252-1.3 2.127-1.619 1.641-.6 3.504-.354 4.69.616.87.714 1.371 1.757 1.457 3.016.675.157 1.316.385 1.912.695 1.24.645 2.218 1.622 2.786 2.924.8 1.832.841 4.58-1.311 6.694C18.542 23.005 16.093 23.98 12.186 24zm1.638-8.684c-.835-.04-1.578.073-2.21.337-.947.395-1.39 1.06-1.252 1.655.164.712 1.003 1.165 2.062 1.053.748-.08 1.33-.59 1.636-1.573.175-.561.254-1.085.245-1.553a7.923 7.923 0 00-.481.081z" />
    </svg>
  ),
  bluesky: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.495 6.19 3.077-.375.053-.245.076.378.537 2.067 1.533 5.027 4.088 4.808 8.13-.005.1.14.132.182.04 1.087-2.386 1.54-5.15-.065-7.824-1.168-1.94-3.088-2.923-3.088-2.923s4.498-.246 5.819-3.284c.272-.627.596-2.092.596-2.092s.324 1.465.596 2.092c1.321 3.038 5.819 3.284 5.819 3.284s-1.92.983-3.088 2.923c-1.605 2.674-1.152 5.438-.065 7.824.042.092.187.06.182-.04-.219-4.042 2.741-6.597 4.808-8.13.623-.461.753-.484.378-.537 2.59.418 5.405-.45 6.19-3.077C23.622 9.418 24 4.458 24 3.768c0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    </svg>
  ),
  linkedin: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  mastodon: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 00.023-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.547c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054 19.648 19.648 0 004.636.536c.397 0 .794 0 1.192-.013 1.99-.067 4.088-.193 5.647-.752.039-.014.076-.03.113-.047 2.37-.908 3.768-2.852 4.115-4.968l.04-.322c.068-.676.17-2.067.17-2.067.04-1.386-.017-2.773-.34-4.14zM19.69 14.45h-3.382V8.086c0-1.34-.564-2.02-1.692-2.02-1.247 0-1.872.807-1.872 2.4v3.481h-3.362V8.466c0-1.593-.625-2.4-1.872-2.4-1.128 0-1.692.68-1.692 2.02v6.364H2.436V7.908c0-1.34.34-2.405 1.025-3.195.705-.79 1.627-1.195 2.772-1.195 1.324 0 2.329.507 2.997 1.523L12 9.07l2.77-4.03c.668-1.015 1.673-1.522 2.997-1.522 1.144 0 2.066.405 2.771 1.195.686.79 1.025 1.855 1.025 3.195v6.537z" />
    </svg>
  ),
  generic: ({ size, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

interface SocialIconProps {
  /** Full URL (e.g. "https://x.com/elonmusk") or plain handle (e.g. "@elonmusk") */
  handle: string;
  size?: number;
  color?: string;
  className?: string;
}

export default function SocialIcon({
  handle,
  size = 14,
  color = "currentColor",
  className,
}: SocialIconProps) {
  const platform = detectPlatform(handle);
  const Icon = ICONS[platform];
  const displayName = extractDisplayName(handle);
  const clickable = isUrl(handle);

  const content = (
    <>
      <Icon size={size} color={color} />
      <span>{displayName}</span>
    </>
  );

  if (clickable) {
    return (
      <a
        href={handle}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={`${PLATFORM_LABELS[platform]} profile`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35em",
          color: "inherit",
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.35em" }}
    >
      {content}
    </span>
  );
}
