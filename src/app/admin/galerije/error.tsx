"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="card w-full max-w-sm p-8 text-center">
        <h1 className="mb-3 text-2xl text-[var(--fg)]">Greška u admin panelu</h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
          Došlo je do greške. Pokušajte ponovo.
        </p>
        <button onClick={reset} className="btn btn-primary w-full">
          Pokušajte ponovo
        </button>
      </div>
    </div>
  );
}
