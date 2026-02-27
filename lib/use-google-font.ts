"use client";

import { useEffect, useRef } from "react";

/**
 * Dynamically loads a Google Font by injecting a <link> tag.
 * Tracks loaded fonts globally so each is only requested once.
 */

const loadedFonts = new Set<string>();

export function useGoogleFont(fontName: string | null | undefined) {
  const loaded = useRef(false);

  useEffect(() => {
    if (!fontName || loaded.current) return;
    if (loadedFonts.has(fontName)) {
      loaded.current = true;
      return;
    }

    const family = fontName.replace(/ /g, "+");
    const href = `https://fonts.googleapis.com/css2?family=${family}:wght@200;300;400;500;600;700&display=swap`;

    // Check if already in document
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      loadedFonts.add(fontName);
      loaded.current = true;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    loadedFonts.add(fontName);
    loaded.current = true;
  }, [fontName]);
}

/**
 * Preload multiple Google Fonts at once (for grid pages).
 */
export function useGoogleFonts(fontNames: (string | null | undefined)[]) {
  useEffect(() => {
    const toLoad = fontNames.filter(
      (f): f is string => !!f && !loadedFonts.has(f),
    );
    if (toLoad.length === 0) return;

    toLoad.forEach((fontName) => {
      const family = fontName.replace(/ /g, "+");
      const href = `https://fonts.googleapis.com/css2?family=${family}:wght@200;300;400;500;600;700&display=swap`;

      const existing = document.querySelector(`link[href="${href}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }

      loadedFonts.add(fontName);
    });
  }, [fontNames]);
}
