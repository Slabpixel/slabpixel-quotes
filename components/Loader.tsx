"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete,
        });
      },
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );

    tl.to(textRef.current, {
      opacity: 0.3,
      duration: 0.4,
      repeat: 2,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, [onComplete]);

  return (
    <div ref={loaderRef} className="loader">
      <span ref={textRef} className="loader__text">
        Loading Quotes
      </span>
    </div>
  );
}
