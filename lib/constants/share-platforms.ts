export type SharePlatform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagramPost"
  | "instagramStory";

export interface SharePlatformConfig {
  width: number;
  height: number;
  label: string;
}

export const SHARE_PLATFORMS: Record<SharePlatform, SharePlatformConfig> = {
  twitter: { width: 1200, height: 630, label: "X (Twitter)" },
  linkedin: { width: 1200, height: 630, label: "LinkedIn" },
  facebook: { width: 1200, height: 630, label: "Facebook" },
  instagramPost: { width: 1080, height: 1080, label: "Instagram Post" },
  instagramStory: { width: 1080, height: 1920, label: "Instagram Story" },
};

export const DEFAULT_SHARE_PLATFORM: SharePlatform = "twitter";
