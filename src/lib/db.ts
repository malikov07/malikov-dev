import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next's dev server re-evaluates modules on every edit, and a serverless
// container re-uses this module across warm invocations. Caching on globalThis
// covers both cases: one connection pool per process rather than one per reload
// or one per request.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  // Fail loudly here rather than at the first query. A missing URL used to fall
  // back to a local SQLite file, which on a serverless host meant the site
  // looked healthy while quietly writing requests to a disk about to vanish.
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. It must be a Postgres connection string — on " +
        "Neon use the pooled endpoint (the host containing `-pooler`).",
    );
  }

  // A leftover `file:./prisma/dev.db` from the SQLite era parses as a valid
  // string and only fails later, deep inside pg, with an error that says
  // nothing about the real cause. Name it here instead.
  if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    throw new Error(
      `DATABASE_URL must start with "postgresql://" — got "${connectionString.slice(0, 12)}…". ` +
        "This project moved from SQLite to Postgres; see DEPLOY.md.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
    // Every warm serverless instance holds its own pool, so these stay small
    // and the provider's own pooler handles fan-in. A large max here would
    // exhaust the database's connection limit as soon as traffic scales out.
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
