/**
 * Offscreen canvas renderer for quote cards.
 * Draws each quote as a styled canvas element, then packs them into a texture atlas.
 */

import { type QuoteData } from "@/types/quote";
import { parseSocialHandle, loadSocialIconImage, type SocialPlatform } from "@/lib/social";

// Cache loaded icon images by "platform:color" key to avoid redundant fetches
const iconCache = new Map<string, HTMLImageElement | null>();
async function getCachedIcon(
  platform: SocialPlatform,
  color: string,
): Promise<HTMLImageElement | null> {
  const key = `${platform}:${color}`;
  if (iconCache.has(key)) return iconCache.get(key)!;
  const img = await loadSocialIconImage(platform, color);
  iconCache.set(key, img);
  return img;
}

const DEFAULT_PALETTES = [
  ["#1a1a2e", "#e94560", "#f0f0f0", "#999999"],
  ["#0d1b2a", "#66d9ef", "#e0e1dd", "#415a77"],
  ["#2d2d2d", "#f5c842", "#f5f5f0", "#8b7a3a"],
  ["#1b1b2f", "#e43f5a", "#f0f0f0", "#7a7a9a"],
  ["#0b0c10", "#66fcf1", "#e8e8e8", "#45a29e"],
  ["#1a1a1a", "#ff6b6b", "#fefefe", "#c44569"],
  ["#16213e", "#a78bfa", "#eef0ff", "#533483"],
  ["#2c003e", "#d72631", "#f5f5f5", "#a2d5c6"],
];

function getPalette(quote: QuoteData, index: number): string[] {
  if (quote.colorPalette) {
    try {
      return JSON.parse(quote.colorPalette);
    } catch {
      // fall through
    }
  }
  return DEFAULT_PALETTES[index % DEFAULT_PALETTES.length];
}

export interface CardTexture {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  quoteIndex: number;
}

export interface TextureAtlas {
  canvas: HTMLCanvasElement;
  blurryCanvas: HTMLCanvasElement;
  imageInfos: {
    width: number;
    height: number;
    uvs: { xStart: number; xEnd: number; yStart: number; yEnd: number };
  }[];
}

const CARD_WIDTH = 500;
const CARD_HEIGHT = 400;
const CARD_RADIUS = 24;
const CARD_PADDING = 50;

/**
 * Wait for a Google Font to finish loading, with a timeout.
 */
async function ensureFontLoaded(
  fontName: string,
  timeout = 3000,
): Promise<boolean> {
  if (!fontName) return false;

  // Inject link tag if not already present
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@200;300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // Wait for the font to actually load
  try {
    await Promise.race([
      document.fonts.load(`400 48px "${fontName}"`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Render a single quote card to an offscreen canvas.
 */
export async function renderCardToCanvas(
  quote: QuoteData,
  index: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * 2; // 2x for retina
  canvas.height = CARD_HEIGHT * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  const palette = getPalette(quote, index);
  const bgColor = palette[0] || "#1a1a2e";
  const accentColor = palette[1] || "#e94560";
  const textColor = palette[2] || "#f0f0f0";
  const mutedColor = palette[3] || "#999999";

  // Background with rounded corners
  roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Subtle gradient overlay
  const grad = ctx.createRadialGradient(
    CARD_WIDTH * 0.8,
    CARD_HEIGHT * 0.8,
    0,
    CARD_WIDTH * 0.8,
    CARD_HEIGHT * 0.8,
    CARD_WIDTH * 0.7,
  );
  grad.addColorStop(0, accentColor + "18");
  grad.addColorStop(1, "transparent");
  roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fillStyle = grad;
  ctx.fill();

  // Mood-specific decorations
  if (quote.mood === "bold") {
    ctx.fillStyle = accentColor;
    roundRect(ctx, 0, 0, 5, CARD_HEIGHT, 0);
    ctx.fill();
  } else if (quote.mood === "minimal") {
    ctx.strokeStyle = textColor + "20";
    ctx.lineWidth = 1;
    roundRect(ctx, 1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2, CARD_RADIUS);
    ctx.stroke();
  } else if (quote.mood === "intense") {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    roundRect(ctx, 2, 2, CARD_WIDTH - 4, CARD_HEIGHT - 4, CARD_RADIUS);
    ctx.stroke();
  } else if (quote.mood === "raw") {
    ctx.strokeStyle = accentColor + "80";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, 3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, CARD_RADIUS);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Quote text
  const fontFamily = quote.fontPrimary
    ? `"${quote.fontPrimary}", serif`
    : "serif";
  const fontSize =
    quote.text.length > 120 ? 22 : quote.text.length > 80 ? 26 : 30;
  const fontWeight =
    quote.mood === "bold" || quote.mood === "intense" ? "500" : "300";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColor;

  const maxTextWidth = CARD_WIDTH - CARD_PADDING * 2;
  const lineHeight = fontSize * 1.5;
  const quoteText = `\u201C${quote.text}\u201D`;
  const lines = wrapText(ctx, quoteText, maxTextWidth, lineHeight);

  const textStartY = CARD_PADDING + 20;
  lines.forEach((line, i) => {
    ctx.fillText(line, CARD_PADDING, textStartY + i * lineHeight);
  });

  // Footer pinned to bottom (like flex space-between)
  const footerBottomMargin = CARD_PADDING;
  const handleY = CARD_HEIGHT - footerBottomMargin;
  const attrY = quote.socialHandle ? handleY - 22 : handleY;

  // Attribution
  ctx.font = `600 13px "Inter", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.letterSpacing = "1.5px";
  ctx.fillText(quote.attribution.toUpperCase(), CARD_PADDING, attrY);

  // Social handle — platform icon + @username
  if (quote.socialHandle) {
    const social = parseSocialHandle(quote.socialHandle);
    const handleBaseline = attrY + 22;
    const ICON_SIZE = 13; // logical pixels (doubled by the ctx.scale)
    const ICON_GAP = 5;

    let textX = CARD_PADDING;

    if (social.platform !== "unknown") {
      const iconImg = await getCachedIcon(social.platform, mutedColor);
      if (iconImg) {
        // Center icon vertically on the baseline
        ctx.drawImage(
          iconImg,
          CARD_PADDING,
          handleBaseline - ICON_SIZE,
          ICON_SIZE,
          ICON_SIZE,
        );
        textX = CARD_PADDING + ICON_SIZE + ICON_GAP;
      }
    }

    ctx.font = `400 12px "Inter", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = mutedColor;
    ctx.letterSpacing = "0px";
    ctx.fillText(social.username, textX, handleBaseline);
  }

  return canvas;
}

/**
 * Build a texture atlas from multiple quote cards.
 * Arranges them in a grid for efficient GPU sampling.
 */
export async function buildTextureAtlas(
  quotes: QuoteData[],
): Promise<TextureAtlas> {
  // Pre-load all fonts
  const fontNames = [
    ...new Set(quotes.map((q) => q.fontPrimary).filter(Boolean)),
  ] as string[];
  await Promise.all(fontNames.map((f) => ensureFontLoaded(f)));

  // Render all cards (async so icons can be loaded)
  const cards = await Promise.all(quotes.map((q, i) => renderCardToCanvas(q, i)));

  // Calculate atlas dimensions — arrange in a grid
  const cols = Math.ceil(Math.sqrt(cards.length));
  const rows = Math.ceil(cards.length / cols);
  const cardW = CARD_WIDTH * 2; // retina
  const cardH = CARD_HEIGHT * 2;
  const atlasWidth = cols * cardW;
  const atlasHeight = rows * cardH;

  // Create atlas canvas
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = atlasWidth;
  atlasCanvas.height = atlasHeight;
  const ctx = atlasCanvas.getContext("2d")!;

  const imageInfos: TextureAtlas["imageInfos"] = [];

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cardW;
    const y = row * cardH;

    ctx.drawImage(card, x, y);

    imageInfos.push({
      width: cardW,
      height: cardH,
      uvs: {
        xStart: x / atlasWidth,
        xEnd: (x + cardW) / atlasWidth,
        // Canvas Y is top-down, UV Y is bottom-up
        yStart: 1 - y / atlasHeight,
        yEnd: 1 - (y + cardH) / atlasHeight,
      },
    });
  });

  // Create blurry version
  const blurryCanvas = document.createElement("canvas");
  blurryCanvas.width = atlasWidth;
  blurryCanvas.height = atlasHeight;
  const blurCtx = blurryCanvas.getContext("2d")!;
  blurCtx.filter = "blur(60px)";
  blurCtx.drawImage(atlasCanvas, 0, 0);

  return { canvas: atlasCanvas, blurryCanvas, imageInfos };
}
