import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "./env.js";

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
  });

  return new PrismaClient({
    adapter,
    log: env.nodeEnv === "production" ? ["error"] : ["warn", "error"],
  });
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}