import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Build pool URL for @prisma/adapter-mariadb. Defaults match the driver's
 * `mariadb` pool: connectTimeout 1s and acquireTimeout 10s are often too low
 * for remote TLS or cold starts; override via URL query or env.
 */
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  const normalized = raw.replace(/^mysql:\/\//, "mariadb://");
  try {
    const url = new URL(normalized);
    const connectMs = process.env.DATABASE_CONNECT_TIMEOUT_MS ?? "30000";
    const acquireMs = process.env.DATABASE_ACQUIRE_TIMEOUT_MS ?? "45000";
    if (!url.searchParams.has("connectTimeout")) {
      url.searchParams.set("connectTimeout", connectMs);
    }
    if (!url.searchParams.has("acquireTimeout")) {
      url.searchParams.set("acquireTimeout", acquireMs);
    }
    return url.toString();
  } catch {
    return normalized;
  }
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(resolveDatabaseUrl());
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
