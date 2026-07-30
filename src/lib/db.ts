import { PrismaNeon } from "@prisma/adapter-neon";
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

  // Neon's own driver rather than plain node-postgres, for two reasons.
  //
  // It talks to Neon over WebSockets on port 443 instead of the Postgres wire
  // protocol on 5432. Plenty of networks — including mobile and consumer ISPs
  // in Uzbekistan — complete the TCP handshake on 5432 and then silently drop
  // the payload, which surfaces as a connection that hangs until it times out
  // rather than as a clean refusal. Port 443 looks like ordinary HTTPS and is
  // not treated that way.
  //
  // It is also the better fit for serverless: no TCP pool to keep warm between
  // invocations, and nothing to exhaust the database's connection limit when
  // the platform scales instances out.
  //
  // `PrismaNeon` (WebSocket) rather than `PrismaNeonHttp`, because the HTTP
  // variant cannot do transactions — and the admin decision flow writes a
  // status change and its audit event together.
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
