export function slideInOutTransition() {
  if (typeof document === "undefined") return;

  // Page-to-page: "blink" transition (instant hide/show), no smooth fade.
  document.documentElement.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: 90,
      // Step easing makes the opacity change effectively instantaneous.
      easing: "steps(1, end)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    },
  );

  document.documentElement.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    {
      duration: 90,
      easing: "steps(1, end)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    },
  );
}
