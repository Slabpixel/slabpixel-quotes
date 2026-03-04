/**
 * Preset card backgrounds.
 * Images live in /public/backgrounds/<id>.jpg (or .png / .webp).
 * The `id` is what gets stored in Quote.backgroundId.
 */
export interface Background {
  id: string;
  label: string;
  /** Path relative to the public root, ready for use in <img src> or CSS url() */
  src: string;
}

export const BACKGROUNDS: Background[] = [
  {
    id: "abstract-01",
    label: "Abstract 01",
    src: "/backgrounds/abstract-01.jpg",
  },
  {
    id: "abstract-02",
    label: "Abstract 02",
    src: "/backgrounds/abstract-02.jpg",
  },
  {
    id: "texture-paper",
    label: "Paper",
    src: "/backgrounds/texture-paper.jpg",
  },
  {
    id: "texture-grain",
    label: "Grain",
    src: "/backgrounds/texture-grain.jpg",
  },
  {
    id: "texture-linen",
    label: "Linen",
    src: "/backgrounds/texture-linen.jpg",
  },
  {
    id: "nature-mist",
    label: "Misty Forest",
    src: "/backgrounds/nature-mist.jpg",
  },
  { id: "nature-ocean", label: "Ocean", src: "/backgrounds/nature-ocean.jpg" },
  {
    id: "nature-desert",
    label: "Desert",
    src: "/backgrounds/nature-desert.jpg",
  },
  {
    id: "dark-marble",
    label: "Dark Marble",
    src: "/backgrounds/dark-marble.jpg",
  },
  {
    id: "dark-concrete",
    label: "Concrete",
    src: "/backgrounds/dark-concrete.jpg",
  },
  {
    id: "gradient-warm",
    label: "Warm Gradient",
    src: "/backgrounds/gradient-warm.jpg",
  },
  {
    id: "gradient-cool",
    label: "Cool Gradient",
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
