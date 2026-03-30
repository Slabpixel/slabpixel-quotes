/**
 * Client-side canvas rendering for share card image.
 * Matches the site card design: background (image or palette), white rounded card,
 * quote text with fontPrimary, attribution, submitter, social handles.
 */

import type { QuoteData } from "@/types/quote";
import { resolveQuoteBackground } from "@/lib/quote-background";
import { getPaletteForQuote } from "@/lib/quote-presets";
import { FONT_OPTIONS } from "@/lib/quote-presets";
import type { SharePlatform } from "@/lib/constants/share-platforms";
import { SHARE_PLATFORMS } from "@/lib/constants/share-platforms";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timeout = window.setTimeout(() => {
      reject(new Error("Image load timeout"));
    }, 5000);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = (err) => {
      window.clearTimeout(timeout);
      reject(err);
    };
    img.src = src;
  });
}

/** Ensure font is loaded (inject Google Font link if needed, then wait for document.fonts). */
async function ensureFontLoaded(fontName: string | null): Promise<void> {
  if (!fontName || typeof document === "undefined") return;
  const option = FONT_OPTIONS.find((f) => f.value === fontName);
  if (option?.google) {
    const family = fontName.replace(/ /g, "+");
    const href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }
  try {
    const loadPromise = document.fonts.load(`20px "${fontName}"`).then(() => {
      /* loaded */
    });
    // Avoid hanging forever on browsers that never resolve fonts.load
    await Promise.race([
      loadPromise,
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {
    // use fallback
  }
}

/** Wrap text into lines that fit within maxWidth. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    const m = ctx.measureText(next);
    if (m.width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type ShareCardProgressStep =
  | "start"
  | "background"
  | "font"
  | "layout"
  | "encode"
  | "done";

export async function generateShareCardBlob(
  quote: QuoteData,
  platform: SharePlatform,
  origin: string,
  onProgress?: (step: ShareCardProgressStep) => void,
  paletteIndex = 0,
): Promise<Blob> {
  onProgress?.("start");
  const config = SHARE_PLATFORMS[platform];
  if (!config) throw new Error("Invalid platform");
  const { width: w, height: h } = config;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d not available");

  const bgResolved = resolveQuoteBackground(quote);
  const palette = getPaletteForQuote(quote, paletteIndex);
  const bgColor = palette[0] || "#111111";
  const accentColor = palette[1] || "#e94560";
  const textColor = palette[2] || "#1a1a1a";
  const mutedColor = palette[3] || "#424242";

  // 1) Background
  onProgress?.("background");
  if (bgResolved.type === "preset" || bgResolved.type === "custom") {
    try {
      const src =
        bgResolved.type === "custom"
          ? bgResolved.src
          : origin
            ? `${origin}${bgResolved.src}`
            : bgResolved.src;
      const img = await loadImage(src);
      // cover
      const scale = Math.max(w / img.width, h / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
    } catch {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    }
  } else if (bgResolved.type === "solid") {
    ctx.fillStyle = bgResolved.color;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }
  // Overlay (match site: bg-black/30)
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, w, h);

  onProgress?.("font");
  await ensureFontLoaded(quote.fontPrimary);
  const fontFamily = quote.fontPrimary
    ? `"${quote.fontPrimary}", serif`
    : "system-ui, serif";

  // 2) White card — match site: rounded-4xl (32), centered, max width ~60% of canvas
  const cardRadius = 32;
  const cardMaxWidth = Math.min(w * 0.65, 720);
  const cardWidth = cardMaxWidth;
  const cardX = (w - cardWidth) / 2;
  const innerPad = Math.round(24 * (Math.min(w, h) / 600));
  const quoteFontSize = Math.round(22 * (Math.min(w, h) / 600));
  const attrFontSize = Math.round(14 * (Math.min(w, h) / 600));
  const metaFontSize = Math.round(12 * (Math.min(w, h) / 600));
  const textWidth = cardWidth - innerPad * 2;

  // Measure quote lines to get card height (no extra quotation marks – match site card)
  onProgress?.("layout");
  ctx.font = `500 ${quoteFontSize}px ${fontFamily}`;
  const quoteLines = wrapText(ctx, quote.text, textWidth);
  const lineHeight = Math.round(quoteFontSize * 1.4);
  const quoteBlockHeight = quoteLines.length * lineHeight + 12;
  const attrHeight = attrFontSize * 1.5;
  const metaHeight = metaFontSize * 2.5;
  const cardContentHeight =
    quoteBlockHeight + attrHeight + 20 + innerPad * 2 + metaHeight + innerPad;
  const cardHeight = Math.min(cardContentHeight, h * 0.85);
  const cardY2 = (h - cardHeight) / 2;

  ctx.fillStyle = "#ffffff";
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(cardX, cardY2, cardWidth, cardHeight, cardRadius);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cardX + cardRadius, cardY2);
    ctx.arcTo(cardX + cardWidth, cardY2, cardX + cardWidth, cardY2 + cardHeight, cardRadius);
    ctx.arcTo(cardX + cardWidth, cardY2 + cardHeight, cardX, cardY2 + cardHeight, cardRadius);
    ctx.arcTo(cardX, cardY2 + cardHeight, cardX, cardY2, cardRadius);
    ctx.arcTo(cardX, cardY2, cardX + cardWidth, cardY2, cardRadius);
    ctx.closePath();
    ctx.fill();
  }

  // 3) Quote text
  let y = cardY2 + innerPad;
  ctx.fillStyle = textColor;
  ctx.font = `500 ${quoteFontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  for (const line of quoteLines) {
    ctx.fillText(line, cardX + innerPad, y);
    y += lineHeight;
  }

  // 4) Attribution
  y += 8;
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = accentColor;
  ctx.font = `${attrFontSize}px ${fontFamily}`;
  ctx.fillText(quote.attribution, cardX + innerPad, y);
  ctx.restore();
  y += attrHeight + 8;

  // 6) SlabPixel branding bottom-right
  ctx.font = `600 ${metaFontSize - 1}px system-ui, sans-serif`;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = mutedColor;
  const brand = "SlabPixel Quotes";
  const brandW = ctx.measureText(brand).width;
  ctx.fillText(brand, cardX + cardWidth - innerPad - brandW, cardY2 + cardHeight - innerPad - metaFontSize);
  ctx.restore();

  onProgress?.("encode");
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.("done");
          resolve(blob);
        } else {
          reject(new Error("toBlob failed"));
        }
      },
      "image/png",
      1,
    );
  });
}
