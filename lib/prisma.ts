import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Subir quando o schema mudar para invalidar client em hot-reload. */
const PRISMA_SCHEMA_VERSION = 3;

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.PRISMA_DATABASE_URL ??
    process.env.POSTGRES_URL ??
    null
  );
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

function createPrismaClient() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (ou PRISMA_DATABASE_URL / POSTGRES_URL) não configurada.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION
  ) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }
  return globalForPrisma.prisma;
}

/** Client lazy — só conecta na primeira query (não quebra o build sem DATABASE_URL). */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
