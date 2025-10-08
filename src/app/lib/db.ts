import { PrismaClient } from "../../generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Env {
  DB: D1Database;
}

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const { env } = getCloudflareContext();
    const adapter = new PrismaD1(env.DB);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

// Legacy function for backward compatibility
export function createPrismaClient(env: Env) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
