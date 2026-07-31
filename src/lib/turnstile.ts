// src/lib/turnstile.ts
import type { NextRequest } from "next/server";

type VerifyResp = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

/** Neuspeh nosi status i poruku koje ruta prosleđuje klijentu. */
export type TurnstileResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/** IP bez any – čita standardne headere */
function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

/**
 * Provera Turnstile tokena kod Cloudflare-a. Jedina kapija protiv botova —
 * klijentska provera se lako zaobiđe direktnim POST-om na rutu, pa svaka
 * ruta koja šalje mejl mora da pozove ovo pre bilo kakvog slanja.
 *
 * Uvek odbija kad ne može da potvrdi (nema tokena, nema tajnog ključa,
 * Cloudflare kaže "ne") — nikad ne propušta "u fail-open" režimu.
 */
export async function verifyTurnstile(
  req: NextRequest,
  rawToken: unknown
): Promise<TurnstileResult> {
  const token = String(rawToken || "").trim();
  if (!token) return { ok: false, status: 400, message: "Missing captcha" };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Konfiguraciona greška na serveru — ne sme da se pretvori u prolaz za botove.
    console.error("Turnstile: TURNSTILE_SECRET_KEY nije podešen");
    return { ok: false, status: 500, message: "Captcha not configured" };
  }

  const ip = getClientIp(req);

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    }
  );

  const verifyJson = (await verifyRes.json()) as VerifyResp;
  if (!verifyJson.success) {
    const code = verifyJson["error-codes"]?.join(", ") || "unknown_error";
    return { ok: false, status: 400, message: `Captcha failed: ${code}` };
  }

  return { ok: true };
}
