/**
 * Preset card backgrounds.
 * Images live in /public/backgrounds/<id>.jpg (or .png / .webp).
 * The `id` is what gets stored in Quote.backgroundId.
 */
export interface Background {
  id: string;
  label: string;
  type: "image" | "solid";
  /** Path relative to the public root, ready for use in <img src> or CSS url() */
  src?: string;
  color?: string;
}

export const BACKGROUNDS: Background[] = [
  {
    id: "solid-paper",
    label: "Paper White",
    type: "solid",
    color: "#f5f5f5",
  },
  {
    id: "solid-sand",
    label: "Warm Sand",
    type: "solid",
    color: "#efe4d2",
  },
  {
    id: "solid-sky",
    label: "Soft Sky",
    type: "solid",
    color: "#e6eef7",
  },
  {
    id: "solid-mint",
    label: "Calm Mint",
    type: "solid",
    color: "#dfeee8",
  },
  {
    id: "solid-cream",
    label: "Cream",
    type: "solid",
    color: "#fff7e6",
  },
  {
    id: "solid-peach",
    label: "Peach Blush",
    type: "solid",
    color: "#ffe9e1",
  },
  {
    id: "solid-lavender",
    label: "Lavender",
    type: "solid",
    color: "#f2e9ff",
  },
  {
    id: "solid-sage",
    label: "Sage",
    type: "solid",
    color: "#e5f3ea",
  },
  {
    id: "solid-sky-soft",
    label: "Soft Sky",
    type: "solid",
    color: "#dff4ff",
  },
  {
    id: "solid-latte",
    label: "Latte",
    type: "solid",
    color: "#f3efe7",
  },
  {
    id: "solid-rose-blush",
    label: "Rose Blush",
    type: "solid",
    color: "#fff0f3",
  },
  {
    id: "solid-sunrise",
    label: "Sunrise",
    type: "solid",
    color: "#fff3d6",
  },
  {
    id: "abstract-01",
    label: "Abstract 01",
    type: "image",
    src: "/backgrounds/abstract-01.jpg",
  },
  {
    id: "abstract-02",
    label: "Abstract 02",
    type: "image",
    src: "/backgrounds/abstract-02.jpg",
  },
  {
    id: "texture-paper",
    label: "Paper",
    type: "image",
    src: "/backgrounds/texture-paper.jpg",
  },
  {
    id: "texture-grain",
    label: "Grain",
    type: "image",
    src: "/backgrounds/texture-grain.jpg",
  },
  {
    id: "texture-linen",
    label: "Linen",
    type: "image",
    src: "/backgrounds/texture-linen.jpg",
  },
  {
    id: "nature-mist",
    label: "Misty Forest",
    type: "image",
    src: "/backgrounds/nature-mist.jpg",
  },
  {
    id: "nature-ocean",
    label: "Ocean",
    type: "image",
    src: "/backgrounds/nature-ocean.jpg",
  },
  {
    id: "nature-desert",
    label: "Desert",
    type: "image",
    src: "/backgrounds/nature-desert.jpg",
  },
  {
    id: "dark-marble",
    label: "Dark Marble",
    type: "image",
    src: "/backgrounds/dark-marble.jpg",
  },
  {
    id: "dark-concrete",
    label: "Concrete",
    type: "image",
    src: "/backgrounds/dark-concrete.jpg",
  },
  {
    id: "gradient-warm",
    label: "Warm Gradient",
    type: "image",
    src: "/backgrounds/gradient-warm.jpg",
  },
  {
    id: "gradient-cool",
    label: "Cool Gradient",
    type: "image",
    src: "/backgrounds/gradient-cool.jpg",
  },
];

/** Look up a background by id. Returns undefined if not found. */
export function getBackground(
  id: string | null | undefined,
): Background | undefined {
  if (!id) return undefined;
  return BACKGROUNDS.find((b) => b.id === id);
}
