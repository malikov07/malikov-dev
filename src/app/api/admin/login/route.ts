import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, cookieOptions, createToken } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Tight limit: this is the only endpoint worth brute-forcing.
  const limited = rateLimit(`login:${clientKey(req)}`, 8, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limited.retryAfter}s.` },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createToken(), cookieOptions);
  return res;
}
