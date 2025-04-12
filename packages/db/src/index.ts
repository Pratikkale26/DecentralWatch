import { PrismaClient } from "@prisma/client";

function prismaClientSingleton() {
  return new PrismaClient();
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prismaClient = globalForPrisma.prisma ?? prismaClientSingleton();

export { prismaClient };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;