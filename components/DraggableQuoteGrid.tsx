"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { type QuoteData } from "@/types/quote";
import QuoteCard from "./QuoteCard";
import DetailOverlay from "./DetailOverlay";

gsap.registerPlugin(Draggable);

interface DraggableQuoteGridProps {
  quotes: QuoteData[];
}

/**
 * Distribute quotes into columns for the masonry-like grid.
 * Alternates to keep columns roughly even.
 */
function distributeIntoColumns(
  quotes: QuoteData[],
  columnCount: number,
): QuoteData[][] {
  const columns: QuoteData[][] = Array.from({ length: columnCount }, () => []);
  quotes.forEach((q, i) => {
    columns[i % columnCount].push(q);
  });
  return columns;
}

export default function DraggableQuoteGrid({
  quotes,
}: DraggableQuoteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine column count based on viewport
  const getColumnCount = useCallback(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  }, []);

  const columns = distributeIntoColumns(quotes, getColumnCount());

  const centerGrid = useCallback(() => {
    if (!gridRef.current) return;

    const gridWidth = gridRef.current.offsetWidth;
    const gridHeight = gridRef.current.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const centerX = (windowWidth - gridWidth) / 2;
    const centerY = (windowHeight - gridHeight) / 2;

    gsap.set(gridRef.current, { x: centerX, y: centerY });
  }, []);

  const setupDraggable = useCallback(() => {
    if (!gridRef.current) return;

    const grid = gridRef.current;

    // Clean up previous draggable
    if (draggableRef.current) {
      draggableRef.current.kill();
    }

    draggableRef.current = Draggable.create(grid, {
      type: "x,y",
      bounds: {
        minX: -(grid.offsetWidth - window.innerWidth) - 200,
        maxX: 200,
        minY: -(grid.offsetHeight - window.innerHeight) - 200,
        maxY: 200,
      },
      inertia: true,
      edgeResistance: 0.85,
      allowEventDefault: true,
      onClick: function () {
        // Clicks handled by card's onClick
      },
    })[0];
  }, []);

  // Wheel navigation
  const setupWheelNavigation = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!draggableRef.current) return;

      const deltaX = -e.deltaX * 5;
      const deltaY = -e.deltaY * 5;

      const currentX = gsap.getProperty(grid, "x") as number;
      const currentY = gsap.getProperty(grid, "y") as number;

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      const bounds = draggableRef.current.vars.bounds as {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      };
      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));

      gsap.to(grid, {
        x: clampedX,
        y: clampedY,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Intersection observer for fade-in/out
  const setupIntersectionObserver = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".quote-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          } else {
            gsap.to(entry.target, {
              opacity: 0.3,
              scale: 0.9,
              duration: 0.5,
              ease: "power2.in",
            });
          }
        });
      },
      { root: null, threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // Intro animation
  const playIntro = useCallback(() => {
    if (!gridRef.current || !containerRef.current) return;

    centerGrid();

    const products = gridRef.current.querySelectorAll(".quote-card");
    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoaded(true);
        setupDraggable();
        setupWheelNavigation();
        setupIntersectionObserver();
      },
    });

    tl.set(containerRef.current, { scale: 0.6 });
    tl.set(products, { scale: 0.5, opacity: 0 });

    tl.to(products, {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: { amount: 1, from: "random" },
    });

    tl.to(
      containerRef.current,
      {
        scale: 1,
        duration: 1.2,
        ease: "power3.inOut",
      },
      "-=0.5",
    );
  }, [
    centerGrid,
    setupDraggable,
    setupWheelNavigation,
    setupIntersectionObserver,
  ]);

  // Handle detail open — shift grid left, show overlay
  const handleQuoteClick = useCallback(
    (quote: QuoteData) => {
      if (!isLoaded) return;
      setSelectedQuote(quote);

      if (gridRef.current) {
        gsap.to(containerRef.current, {
          x: "-25vw",
          duration: 0.8,
          ease: "power3.inOut",
        });
      }
    },
    [isLoaded],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedQuote(null);

    gsap.to(containerRef.current, {
      x: 0,
      duration: 0.7,
      ease: "power3.inOut",
    });
  }, []);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedQuote) {
        handleCloseDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedQuote, handleCloseDetail]);

  // Run intro on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(playIntro, 100);
    return () => clearTimeout(timer);
  }, [playIntro]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      centerGrid();
      setupDraggable();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [centerGrid, setupDraggable]);

  return (
    <>
      <div ref={containerRef} className="grid-container">
        <div ref={gridRef} className="quote-grid">
          {columns.map((columnQuotes, colIdx) => (
            <div key={colIdx} className="quote-column">
              {columnQuotes.map((quote, qIdx) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  index={colIdx * 10 + qIdx}
                  onClick={handleQuoteClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DetailOverlay quote={selectedQuote} onClose={handleCloseDetail} />
    </>
  );
}
