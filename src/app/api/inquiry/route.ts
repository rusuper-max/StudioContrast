// src/app/api/inquiry/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlanIncludes } from "@/data/planIncludes";
import { HOME_PACKAGES } from "@/data/homePackages";
import type { PlanSlug } from "@/data/packages";
import type { EventType } from "@/lib/addons";

export const runtime = "nodejs";

/* ───────────── helpers ───────────── */
function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
/** "22" | "930" | "9:5" | "12:70" -> "HH:MM" (clamp) */
function normalizeTime(raw?: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d{1,2}$/.test(s)) {
    const hh = clamp(Number(s), 0, 23);
    return `${String(hh).padStart(2, "0")}:00`;
  }
  if (/^\d{3,4}$/.test(s)) {
    const mm = clamp(Number(s.slice(-2)), 0, 59);
    const hh = clamp(Number(s.slice(0, -2)), 0, 23);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(s);
  if (m) {
    const hh = clamp(Number(m[1]), 0, 23);
    const mm = clamp(Number(m[2]), 0, 59);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return "";
}

const PLAN_NAME: Record<string, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

/* Brend paleta (isti tokeni kao na sajtu) */
const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  ink: "#171412",
  fg: "#211E1A",
  muted: "#6E6759",
  border: "#E7DFD1",
  accent: "#8A6F3C",
  inkFg: "#F6F1E7",
};

/** "2026-08-22" -> "22.08.2026." (ostalo vraća nepromenjeno) */
function formatDate(raw?: string): string {
  const s = String(raw ?? "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}.${m[2]}.${m[1]}.` : s;
}

function prettyLabel(key: string) {
  const k = (key || "").toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog") return "Treći fotograf";
  if (k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k") return "4K video";
  if (k === "drone") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express") return "Ekspres obrada";
  if (k === "raw") return "RAW fajlovi";
  if (k === "printonsite") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  return key;
}

/**
 * Šta paket sadrži — isto što klijent vidi u konfiguratoru:
 *  1) osnovne stavke plana za taj tip događaja (statički podaci),
 *  2) marketing stavke paketa sa sajta,
 *  3) addoni koji su za taj tip/plan označeni kao "uključeno" (iz tabele),
 *  4) dodatne stavke i napomena iz tabele.
 * Tačke 3–4 zavise od /api/inquiry/addons; ako on padne, mejl i dalje
 * sadrži 1) i 2) — nikad se ne šalje bez sadržaja paketa.
 */
async function loadPackageContents(
  origin: string,
  eventType: string,
  plan: PlanSlug | ""
): Promise<{ base: string[]; addons: string[]; extras: string[]; note: string }> {
  const out = { base: [] as string[], addons: [] as string[], extras: [] as string[], note: "" };
  if (!plan) return out;

  // 1) + 2) statički izvori — uvek dostupni
  out.base = getPlanIncludes(eventType as EventType, plan);
  const marketing = HOME_PACKAGES[plan]?.bullets ?? [];
  for (const b of marketing) {
    if (!out.base.some((x) => x.toLowerCase() === b.toLowerCase())) out.base.push(b);
  }

  // 3) + 4) živi podaci iz tabele dodataka
  try {
    const res = await fetch(`${origin}/api/inquiry/addons?debug=0`, {
      cache: "no-store",
      // tabela ne sme da zadrži slanje mejla
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const rules = data?.addons?.[eventType]?.[plan] ?? {};
      out.addons = Object.entries(rules)
        .filter(([key, rule]: [string, any]) => rule?.state === "included" && key !== "dontPublish")
        .map(([key]) => prettyLabel(key));

      const extrasRaw: string[] = data?.extrasIncluded?.[eventType]?.[plan] ?? [];
      const seen = new Set<string>();
      out.extras = extrasRaw.filter((x) => {
        const k = String(x).trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      out.note = String(data?.notes?.[eventType]?.[plan] ?? "");
    }
  } catch {
    /* tabela nedostupna — ostaju statičke stavke */
  }
  return out;
}

/** Preferira body.addons[], ali radi i sa starim boolean poljima. */
function extractAddons(body: any): string[] {
  const set = new Set<string>();
  if (Array.isArray(body?.addons)) for (const k of body.addons) if (k) set.add(String(k));

  const booleanKeys = [
    "secondPhotog","thirdPhotog","secondVideographer","video","video4k","drone",
    "album","express","raw","printOnSite","usb","dontPublish",
  ];
  for (const k of booleanKeys) {
    const v = body?.[k];
    const isTrue =
      v === true || v === 1 ||
      (typeof v === "string" && ["1","true","yes","da"].includes(v.toLowerCase()));
    if (isTrue) set.add(k);
  }
  return Array.from(set);
}

/* ───────────── route ───────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: { user: process.env.EMAIL_USER!, pass: process.env.EMAIL_PASS! },
    });

    const to = process.env.MAIL_TO || process.env.EMAIL_USER;
    const from = process.env.MAIL_FROM || process.env.EMAIL_USER;

    const typeDisplay = body?.type?.trim?.() ? String(body.type) : "Nije navedeno";
    const start = normalizeTime(body?.start);
    const end = normalizeTime(body?.end);

    const planSlug = String(body?.plan || "");
    const planName = PLAN_NAME[planSlug] || (planSlug ? planSlug : "—");
    const dateDisplay = formatDate(body?.date);

    const priceHintNum = Number(body?.priceHint || 0);
    const priceHint = Number.isFinite(priceHintNum) && priceHintNum > 0
      ? priceHintNum.toLocaleString("sr-RS")
      : null;

    const extraHoursNum = Number(body?.extraHours || 0);
    const extraHours = Number.isFinite(extraHoursNum) && extraHoursNum > 0 ? extraHoursNum : 0;

    const addons = extractAddons(body);
    const addonsHtml = addons.length
      ? `<ul style="margin:0;padding-left:18px;">${addons
          .map((k) => `<li style="margin:3px 0;">${escapeHtml(prettyLabel(k))}</li>`)
          .join("")}</ul>`
      : `<span style="color:${C.muted};">—</span>`;
    const addonsText = addons.length ? addons.map((k) => prettyLabel(k)).join(", ") : "—";

    /* Sadržaj paketa — da se ne mora otvarati sajt da bi se videlo šta paket nosi */
    const origin = new URL(req.url).origin || process.env.NEXT_PUBLIC_SITE_URL || "";
    const contents = await loadPackageContents(origin, typeDisplay, planSlug as PlanSlug | "");
    const contentItems = [...contents.base, ...contents.addons, ...contents.extras];

    const contentsHtml = contentItems.length
      ? `<ul style="margin:0;padding-left:18px;">${contentItems
          .map((it) => `<li style="margin:3px 0;">${escapeHtml(it)}</li>`)
          .join("")}</ul>${
          contents.note
            ? `<div style="margin-top:10px;font-style:italic;color:${C.muted};">${escapeHtml(contents.note)}</div>`
            : ""
        }`
      : `<div style="color:${C.muted};">Sadržaj paketa nije bilo moguće učitati — proverite tabelu dodataka.</div>`;

    const contentsText = contentItems.length
      ? contentItems.map((it) => `  • ${it}`).join("\n") +
        (contents.note ? `\n  Napomena: ${contents.note}` : "")
      : "  (sadržaj paketa nije bilo moguće učitati)";

    // Subject nosi ono po čemu se upit prepoznaje u inboxu: tip, datum, mesto
    const locationShort = String(body?.location || "").trim();
    const subject = `Upit — ${typeDisplay}${dateDisplay ? `, ${dateDisplay}` : ""}${
      locationShort ? ` · ${locationShort}` : ""
    } (${planName})`;

    /* ── HTML: ista paleta i ritam kao sajt (ivory, ink, šampanj, hairline) ── */
    const sansStack =
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    const serifStack = "Georgia,'Times New Roman',Times,serif";

    const eyebrow = (t: string) =>
      `<div style="font:600 11px/1.4 ${sansStack};text-transform:uppercase;letter-spacing:.18em;color:${C.accent};margin:0 0 10px;">${t}</div>`;

    const row = (label: string, value: string) =>
      `<tr>
         <td style="padding:9px 0;border-bottom:1px solid ${C.border};font:400 13px/1.5 ${sansStack};color:${C.muted};white-space:nowrap;vertical-align:top;width:132px;">${label}</td>
         <td style="padding:9px 0;border-bottom:1px solid ${C.border};font:400 15px/1.5 ${sansStack};color:${C.fg};">${value}</td>
       </tr>`;

    const block = (title: string, inner: string) =>
      `<div style="margin:28px 0 0;padding:20px;border:1px solid ${C.border};background:${C.bg};">
         ${eyebrow(title)}
         <div style="font:400 14px/1.6 ${sansStack};color:${C.fg};">${inner}</div>
       </div>`;

    const html = `
      <div style="margin:0;padding:24px 12px;background:${C.bg};">
        <div style="max-width:600px;margin:0 auto;background:${C.surface};border:1px solid ${C.border};">

          <div style="background:${C.ink};padding:26px 28px;">
            <div style="font:400 24px/1.2 ${serifStack};color:${C.inkFg};">Studio <em>Contrast</em></div>
            <div style="font:600 11px/1.4 ${sansStack};text-transform:uppercase;letter-spacing:.22em;color:${C.accent};margin-top:8px;">Novi upit sa sajta</div>
          </div>

          <div style="padding:28px;">
            <div style="font:400 26px/1.2 ${serifStack};color:${C.fg};margin:0 0 4px;">${escapeHtml(typeDisplay)}</div>
            <div style="font:400 14px/1.5 ${sansStack};color:${C.muted};margin:0 0 22px;">
              Paket <strong style="color:${C.accent};">${escapeHtml(planName)}</strong>${
                priceHint ? ` · orijentaciono ~${priceHint} €` : ""
              }
            </div>

            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid ${C.border};">
              ${row("Datum", `${escapeHtml(dateDisplay || "—")}${start || end ? ` <span style="color:${C.muted};">(${start || "—"}–${end || "—"})</span>` : ""}`)}
              ${row("Lokacija", escapeHtml(body?.location || "—"))}
              ${row(
                "Ime",
                `<strong>${escapeHtml(body?.name || "—")}</strong>`
              )}
              ${row(
                "Telefon",
                body?.phone
                  ? `<a href="tel:${escapeHtml(String(body.phone).replace(/\s+/g, ""))}" style="color:${C.fg};text-decoration:underline;">${escapeHtml(body.phone)}</a>`
                  : "—"
              )}
              ${row(
                "Email",
                body?.email
                  ? `<a href="mailto:${escapeHtml(body.email)}" style="color:${C.fg};text-decoration:underline;">${escapeHtml(body.email)}</a>`
                  : "—"
              )}
            </table>

            ${block(`Šta paket ${escapeHtml(planName)} uključuje`, contentsHtml)}

            ${block(
              "Dodaci koje je klijent izabrao",
              `${addonsHtml}
               ${extraHours ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${C.border};">Dodatni sati: <strong>${extraHours}</strong> <span style="color:${C.muted};">(+${extraHours * 60} €)</span></div>` : ""}
               ${priceHint ? `<div style="margin-top:${extraHours ? "6px" : "12px"};${extraHours ? "" : `padding-top:12px;border-top:1px solid ${C.border};`}">Orijentaciona cena: <strong style="font:400 20px/1.2 ${serifStack};">~${priceHint} €</strong></div>` : ""}`
            )}

            ${
              body?.message
                ? block(
                    "Poruka klijenta",
                    `<div style="font:400 15px/1.65 ${serifStack};color:${C.fg};">${escapeHtml(body.message).replace(/\n/g, "<br/>")}</div>`
                  )
                : ""
            }

            ${
              body?.email
                ? `<div style="margin-top:28px;">
                     <a href="mailto:${escapeHtml(body.email)}" style="display:inline-block;background:${C.ink};color:${C.inkFg};font:600 11px/1 ${sansStack};text-transform:uppercase;letter-spacing:.16em;padding:15px 28px;text-decoration:none;">Odgovorite klijentu</a>
                   </div>`
                : ""
            }
          </div>

          <div style="border-top:1px solid ${C.border};padding:16px 28px;font:400 11px/1.5 ${sansStack};text-transform:uppercase;letter-spacing:.14em;color:${C.muted};">
            studiocontrast.rs · Carinska 4, Užice
          </div>
        </div>
      </div>
    `;

    // TEXT
    const text = [
      `Tip događaja: ${typeDisplay}`,
      `Datum: ${dateDisplay || "-"} (${start || "-"}–${end || "-"})`,
      `Lokacija: ${body?.location || "-"}`,
      `Paket: ${planName}`,
      ``,
      `Šta paket ${planName} uključuje:`,
      contentsText,
      ``,
      `Odabrani dodaci: ${addonsText}`,
      extraHours ? `Dodatni sati: ${extraHours}` : ``,
      priceHint ? `Orijentaciona cena: ~${priceHint} €` : ``,
      ``,
      `Kontakt: ${body?.name || "-"} | ${body?.phone || "-"}`,
      `Email: ${body?.email || "-"}`,
      ``,
      `Poruka:`,
      `${body?.message || "-"}`,
    ].filter(Boolean).join("\n");

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: body?.email || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Inquiry mail error:", err?.message || err);
    return new NextResponse("Failed to send", { status: 500 });
  }
}