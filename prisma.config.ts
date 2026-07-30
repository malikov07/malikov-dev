import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer loads `.env` on its own. Node 24 can do it natively.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // No .env in this environment (CI, production) — real env vars are used.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: { path: path.join("prisma", "migrations") },
  datasource: { url: env("DATABASE_URL") },
});
