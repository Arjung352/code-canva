import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.ACCELERATE_URL,
    log: ["query"], // optional (for debugging)
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
