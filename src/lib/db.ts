import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next's dev server re-evaluates modules on every edit, and the production
// server keeps this module for the lifetime of the process. Caching on
// globalThis covers both: one connection pool per process rather than one per
// reload or one per request.
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
      "DATABASE_URL is not set. It must be a Postgres connection string, e.g. " +
        "postgresql://user:pass@localhost:5432/malikov_dev.",
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

  // Plain node-postgres, talking to Postgres on the same machine over the
  // wire protocol on 5432.
  //
  // This was Neon's WebSocket driver on 443 while the site was on Netlify, for
  // two reasons that both stopped applying when it moved to its own server:
  // serverless gave every warm instance its own pool with nothing to keep them
  // warm, and the database was across the internet on a port that consumer ISPs
  // here interfere with. Neither is true of a long-lived process connecting to
  // localhost, where one small pool lives for the life of the server.
  //
  // The pool is deliberately small. This box has under 1 GB of RAM and Postgres
  // is sharing it with the Next server; a handful of connections is more than a
  // single-node intake site ever needs, and each idle one still costs memory on
  // the server side.
  const adapter = new PrismaPg({ connectionString, max: 5 });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
