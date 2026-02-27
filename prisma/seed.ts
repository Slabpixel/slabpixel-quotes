import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const url = process.env.DATABASE_URL!.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing quotes
  await prisma.quote.deleteMany();
  console.log("🗑️  Cleared existing quotes");

  const sampleQuotes = [
    // ─── Bold ────────────────────────────────────
    {
      text: "Design is not just what it looks like and feels like. Design is how it works.",
      attribution: "Steve Jobs",
      socialHandle: "https://x.com/Apple",
      fontPrimary: "Playfair Display",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#0f0f1a",
        "#e94560",
        "#f5f0eb",
        "#8a8a9a",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-01"),
    },
    {
      text: "Have no fear of perfection — you'll never reach it.",
      attribution: "Salvador Dalí",
      socialHandle: "https://instagram.com/thedali",
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#1a0a2e",
        "#f7b731",
        "#f5f5f0",
        "#9b8ec4",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-02"),
    },
    {
      text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.",
      attribution: "Mark Zuckerberg",
      socialHandle: "https://threads.net/@zuck",
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#0a1628",
        "#3b82f6",
        "#e8ecf4",
        "#64748b",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-03"),
    },
    {
      text: "The people who are crazy enough to think they can change the world are the ones who do.",
      attribution: "Rob Siltanen",
      socialHandle: null,
      fontPrimary: "Syne",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#18181b",
        "#ef4444",
        "#fafafa",
        "#a1a1aa",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-04"),
    },

    // ─── Serene ──────────────────────────────────
    {
      text: "Typography is the craft of endowing human language with a durable visual form.",
      attribution: "Robert Bringhurst",
      socialHandle: null,
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#2a2520",
        "#d4a574",
        "#f5f0e8",
        "#8b7355",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-05"),
    },
    {
      text: "White space is to be regarded as an active element, not a passive background.",
      attribution: "Jan Tschichold",
      socialHandle: null,
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#faf8f5",
        "#2d2d2d",
        "#1a1a1a",
        "#999999",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-06"),
    },
    {
      text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
      attribution: "Antoine de Saint-Exupéry",
      socialHandle: null,
      fontPrimary: "EB Garamond",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#1c1917",
        "#a78bfa",
        "#f5f3ff",
        "#78716c",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-07"),
    },
    {
      text: "Every great design begins with an even better story.",
      attribution: "Lorinda Mamo",
      socialHandle: "https://instagram.com/lorindamamo",
      fontPrimary: "Lora",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#0b1d26",
        "#66d9ef",
        "#e0f2fe",
        "#45a29e",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-08"),
    },

    // ─── Minimal ─────────────────────────────────
    {
      text: "The details are not the details. They make the design.",
      attribution: "Charles Eames",
      socialHandle: null,
      fontPrimary: "DM Sans",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#111111",
        "#e2e2e2",
        "#f0f0f0",
        "#555555",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-09"),
    },
    {
      text: "Good design is as little design as possible.",
      attribution: "Dieter Rams",
      socialHandle: "https://youtube.com/@objectified",
      fontPrimary: "Inter",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#fafafa",
        "#171717",
        "#0a0a0a",
        "#a3a3a3",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-10"),
    },
    {
      text: "Less, but better.",
      attribution: "Dieter Rams",
      socialHandle: null,
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#0a0a0a",
        "#22c55e",
        "#ecfdf5",
        "#6b7280",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-11"),
    },
    {
      text: "Styles come and go. Good design is a language, not a style.",
      attribution: "Massimo Vignelli",
      socialHandle: "https://tiktok.com/@vignellidesign",
      fontPrimary: "Outfit",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#18181b",
        "#f97316",
        "#fff7ed",
        "#78716c",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-12"),
    },

    // ─── Playful ─────────────────────────────────
    {
      text: "Color is a power which directly influences the soul.",
      attribution: "Wassily Kandinsky",
      socialHandle: "https://instagram.com/kandinsky_art",
      fontPrimary: "Syne",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#1e1040",
        "#ec4899",
        "#fdf2f8",
        "#7c3aed",
      ]),
      mood: "playful",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-13"),
    },
    {
      text: "Creativity is intelligence having fun.",
      attribution: "Albert Einstein",
      socialHandle: null,
      fontPrimary: "Playfair Display",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#0c0a1d",
        "#facc15",
        "#fefce8",
        "#a16207",
      ]),
      mood: "playful",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-14"),
    },
    {
      text: "Art is not what you see, but what you make others see.",
      attribution: "Edgar Degas",
      socialHandle: null,
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#14202e",
        "#06b6d4",
        "#ecfeff",
        "#0e7490",
      ]),
      mood: "playful",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-15"),
    },

    // ─── Intense ─────────────────────────────────
    {
      text: "If you're not prepared to be wrong, you'll never come up with anything original.",
      attribution: "Ken Robinson",
      socialHandle: "https://x.com/SirKenRobinson",
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#1c0000",
        "#dc2626",
        "#fee2e2",
        "#991b1b",
      ]),
      mood: "intense",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-16"),
    },
    {
      text: "Great things are done by a series of small things brought together.",
      attribution: "Vincent Van Gogh",
      socialHandle: null,
      fontPrimary: "EB Garamond",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#0c1622",
        "#f59e0b",
        "#fffbeb",
        "#92400e",
      ]),
      mood: "intense",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-17"),
    },

    // ─── Dreamy ──────────────────────────────────
    {
      text: "The world always seems brighter when you've just made something that wasn't there before.",
      attribution: "Neil Gaiman",
      socialHandle: "https://bsky.app/profile/neilhimself.bsky.social",
      fontPrimary: "Lora",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#0f172a",
        "#818cf8",
        "#eef2ff",
        "#475569",
      ]),
      mood: "dreamy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-18"),
    },
    {
      text: "And, when you want something, all the universe conspires in helping you to achieve it.",
      attribution: "Paulo Coelho",
      socialHandle: "https://x.com/paulocoelho",
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#1a1033",
        "#c084fc",
        "#f5f3ff",
        "#7e22ce",
      ]),
      mood: "dreamy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-19"),
    },

    // ─── Melancholy ──────────────────────────────
    {
      text: "We are all in the gutter, but some of us are looking at the stars.",
      attribution: "Oscar Wilde",
      socialHandle: null,
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#0c0c14",
        "#94a3b8",
        "#e2e8f0",
        "#334155",
      ]),
      mood: "melancholy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-20"),
    },
    {
      text: "The wound is the place where the Light enters you.",
      attribution: "Rumi",
      socialHandle: null,
      fontPrimary: "EB Garamond",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#1a1520",
        "#d4a574",
        "#f5ece3",
        "#6b5b4f",
      ]),
      mood: "melancholy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-21"),
    },

    // ─── Raw ─────────────────────────────────────
    {
      text: "Stay hungry. Stay foolish.",
      attribution: "Stewart Brand",
      socialHandle: "https://x.com/stewartbrand",
      fontPrimary: "Space Grotesk",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#0a0a0a",
        "#10b981",
        "#d1fae5",
        "#065f46",
      ]),
      mood: "raw",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-22"),
    },
    {
      text: "Done is better than perfect.",
      attribution: "Sheryl Sandberg",
      socialHandle: "https://linkedin.com/in/sherylsandberg",
      fontPrimary: "Outfit",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#171717",
        "#f472b6",
        "#fdf2f8",
        "#9d174d",
      ]),
      mood: "raw",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-23"),
    },
    {
      text: "Make it simple, but significant.",
      attribution: "Don Draper",
      socialHandle: null,
      fontPrimary: "Syne",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#1e1e2e",
        "#cba6f7",
        "#cdd6f4",
        "#585b70",
      ]),
      mood: "raw",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-24"),
    },

    // ─── Extra published ─────────────────────────
    {
      text: "Imagination is the beginning of creation. You imagine what you desire, you will what you imagine.",
      attribution: "George Bernard Shaw",
      socialHandle: null,
      fontPrimary: "Playfair Display",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#0f1729",
        "#38bdf8",
        "#e0f2fe",
        "#0369a1",
      ]),
      mood: "dreamy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-25"),
    },

    // ─── Pending (not shown on grid) ─────────────
    {
      text: "Simplicity is the ultimate sophistication.",
      attribution: "Leonardo da Vinci",
      socialHandle: null,
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#fefefe",
        "#171717",
        "#0a0a0a",
        "#737373",
      ]),
      mood: "minimal",
      status: "PENDING" as const,
      publishedAt: null,
    },
  ];

  for (const quote of sampleQuotes) {
    await prisma.quote.create({ data: quote });
  }

  const publishedCount = sampleQuotes.filter(
    (q) => q.status === "PUBLISHED",
  ).length;
  console.log(
    `✅ Seeded ${sampleQuotes.length} quotes (${publishedCount} published)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
