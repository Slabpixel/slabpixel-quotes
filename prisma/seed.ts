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
      socialHandles: ["https://x.com/Apple"],
      fontPrimary: "Playfair Display",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#f5f5f5",
        "#e94560",
        "#1a1a1a",
        "#666666",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-01"),
    },
    {
      text: "Have no fear of perfection — you'll never reach it.",
      attribution: "Salvador Dalí",
      socialHandles: ["https://instagram.com/thedali"],
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#faf8f5",
        "#f7b731",
        "#422006",
        "#78716c",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-02"),
    },
    {
      text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.",
      attribution: "Mark Zuckerberg",
      socialHandles: ["https://threads.net/@zuck"],
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#f0f4f8",
        "#3b82f6",
        "#0c4a6e",
        "#64748b",
      ]),
      mood: "bold",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-03"),
    },
    {
      text: "The people who are crazy enough to think they can change the world are the ones who do.",
      attribution: "Rob Siltanen",
      socialHandles: [],
      fontPrimary: "Syne",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#fafafa",
        "#ef4444",
        "#171717",
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
      socialHandles: [],
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#f5f3f0",
        "#d4a574",
        "#422006",
        "#8b7355",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-05"),
    },
    {
      text: "White space is to be regarded as an active element, not a passive background.",
      attribution: "Jan Tschichold",
      socialHandles: [],
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
      socialHandles: [],
      fontPrimary: "EB Garamond",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#f5f3ff",
        "#a78bfa",
        "#4c1d95",
        "#78716c",
      ]),
      mood: "serene",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-07"),
    },
    {
      text: "Every great design begins with an even better story.",
      attribution: "Lorinda Mamo",
      socialHandles: ["https://instagram.com/lorindamamo"],
      fontPrimary: "Lora",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#f0f9ff",
        "#66d9ef",
        "#0c4a6e",
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
      socialHandles: [],
      fontPrimary: "DM Sans",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#f5f5f5",
        "#525252",
        "#171717",
        "#737373",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-09"),
    },
    {
      text: "Good design is as little design as possible.",
      attribution: "Dieter Rams",
      socialHandles: ["https://youtube.com/@objectified"],
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
      socialHandles: [],
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#ecfdf5",
        "#22c55e",
        "#064e3b",
        "#6b7280",
      ]),
      mood: "minimal",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-11"),
    },
    {
      text: "Styles come and go. Good design is a language, not a style.",
      attribution: "Massimo Vignelli",
      socialHandles: ["https://tiktok.com/@vignellidesign"],
      fontPrimary: "Outfit",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#fff7ed",
        "#f97316",
        "#9a3412",
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
      socialHandles: ["https://instagram.com/kandinsky_art"],
      fontPrimary: "Syne",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#fdf2f8",
        "#ec4899",
        "#831843",
        "#7c3aed",
      ]),
      mood: "playful",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-13"),
    },
    {
      text: "Creativity is intelligence having fun.",
      attribution: "Albert Einstein",
      socialHandles: [],
      fontPrimary: "Playfair Display",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#fefce8",
        "#facc15",
        "#713f12",
        "#a16207",
      ]),
      mood: "playful",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-14"),
    },
    {
      text: "Art is not what you see, but what you make others see.",
      attribution: "Edgar Degas",
      socialHandles: [],
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#ecfeff",
        "#06b6d4",
        "#134e4a",
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
      socialHandles: ["https://x.com/SirKenRobinson"],
      fontPrimary: "Space Grotesk",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#fef2f2",
        "#dc2626",
        "#7f1d1d",
        "#991b1b",
      ]),
      mood: "intense",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-16"),
    },
    {
      text: "Great things are done by a series of small things brought together.",
      attribution: "Vincent Van Gogh",
      socialHandles: [],
      fontPrimary: "EB Garamond",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#fffbeb",
        "#f59e0b",
        "#78350f",
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
      socialHandles: ["https://bsky.app/profile/neilhimself.bsky.social"],
      fontPrimary: "Lora",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#eef2ff",
        "#818cf8",
        "#3730a3",
        "#475569",
      ]),
      mood: "dreamy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-18"),
    },
    {
      text: "And, when you want something, all the universe conspires in helping you to achieve it.",
      attribution: "Paulo Coelho",
      socialHandles: ["https://x.com/paulocoelho"],
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#f5f3ff",
        "#c084fc",
        "#4c1d95",
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
      socialHandles: [],
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#f1f5f9",
        "#94a3b8",
        "#334155",
        "#64748b",
      ]),
      mood: "melancholy",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-20"),
    },
    {
      text: "The wound is the place where the Light enters you.",
      attribution: "Rumi",
      socialHandles: [],
      fontPrimary: "EB Garamond",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#faf5f0",
        "#d4a574",
        "#422006",
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
      socialHandles: ["https://x.com/stewartbrand"],
      fontPrimary: "Space Grotesk",
      fontSecondary: "DM Sans",
      colorPalette: JSON.stringify([
        "#ecfdf5",
        "#10b981",
        "#064e3b",
        "#065f46",
      ]),
      mood: "raw",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-22"),
    },
    {
      text: "Done is better than perfect.",
      attribution: "Sheryl Sandberg",
      socialHandles: ["https://linkedin.com/in/sherylsandberg"],
      fontPrimary: "Outfit",
      fontSecondary: "Inter",
      colorPalette: JSON.stringify([
        "#fdf2f8",
        "#f472b6",
        "#831843",
        "#9d174d",
      ]),
      mood: "raw",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-23"),
    },
    {
      text: "Make it simple, but significant.",
      attribution: "Don Draper",
      socialHandles: [],
      fontPrimary: "Syne",
      fontSecondary: "Nunito Sans",
      colorPalette: JSON.stringify([
        "#f5f3ff",
        "#cba6f7",
        "#4c1d95",
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
      socialHandles: [],
      fontPrimary: "Playfair Display",
      fontSecondary: "Source Sans Pro",
      colorPalette: JSON.stringify([
        "#e0f2fe",
        "#38bdf8",
        "#0c4a6e",
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
      socialHandles: [],
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
    await prisma.quote.create({
      data: {
        ...quote,
        socialHandles: JSON.stringify(quote.socialHandles),
      },
    });
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
