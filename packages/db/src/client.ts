import { PrismaClient } from "../lib/generated/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  /* eslint-disable-next-line no-var */
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

// This will prevent new connection creation on hot reload

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export * from "../lib/generated/client";
