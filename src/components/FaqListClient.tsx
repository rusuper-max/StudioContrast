"use client";

import { useEffect, useState, type ReactNode } from "react";

export type FaqLite = { id: string; q: string; aJSX: ReactNode };

export default function FaqListClient({ items }: { items: FaqLite[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Aktivacija iz hash-a (klik iz "Brzi skok") + auto-open
  useEffect(() => {
    const applyFromHash = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const id = raw ? raw.slice(1) : null;
      setActiveId(id);
      if (id) {
        const el = document.getElementById(id) as HTMLDetailsElement | null;
        if (el && !el.open) el.open = true;
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  return (
    <div className="border-t border-[var(--border)]">
      {items.map((f, i) => {
        const isActive = activeId === f.id;
        const index = String(i + 1).padStart(2, "0");
        return (
          <details
            key={f.id}
            id={f.id}
            className="group border-b border-[var(--border)] scroll-mt-24 md:scroll-mt-28"
            onToggle={(e) => {
              const open = (e.currentTarget as HTMLDetailsElement).open;
              if (open) {
                setActiveId(f.id);
                // Postavi hash na trenutno pitanje (bez nove istorije)
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", `${window.location.pathname}#${f.id}`);
                }
              } else if (isActive) {
                setActiveId(null);
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", window.location.pathname);
                }
              }
            }}
          >
            <summary
              className="flex cursor-pointer list-none items-baseline gap-4 py-6 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-strong)] md:gap-5 md:py-7 [&::-webkit-details-marker]:hidden"
              onClick={() => {
                setActiveId(f.id);
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", `${window.location.pathname}#${f.id}`);
                }
              }}
            >
              <span
                aria-hidden="true"
                className="w-7 shrink-0 text-[10px] tracking-[0.3em] text-[var(--accent-strong)]"
              >
                {index}
              </span>
              <span
                className={[
                  "flex-1 font-serif text-[19px] leading-snug transition-colors md:text-[22px]",
                  isActive ? "text-[var(--fg)]" : "text-[var(--fg)]/85",
                  "group-open:text-[var(--fg)] group-hover:text-[var(--fg)]",
                ].join(" ")}
              >
                {f.q}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 self-center font-serif text-[24px] font-light leading-none text-[var(--muted)] transition-transform duration-300 group-open:rotate-45 group-open:text-[var(--accent-strong)]"
              >
                +
              </span>
            </summary>
            <div className="pb-8 pl-11 pr-2 md:pb-9 md:pl-12 md:pr-10">
              <div className="max-w-2xl font-serif text-[15.5px] leading-[1.75] text-[var(--muted)]">
                {f.aJSX}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
