"use client";

import { useEffect } from "react";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gallery error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="card w-full max-w-sm p-8 text-center sm:p-10">
        <h1 className="mb-3 text-2xl text-[var(--fg)]">Došlo je do greške</h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
          Nismo uspeli da učitamo galeriju. Pokušajte ponovo za koji trenutak.
        </p>
        <button onClick={reset} className="btn btn-primary w-full">
          Pokušajte ponovo
        </button>
      </div>
      <p className="mt-8 font-serif text-sm text-[var(--muted)]">Studio Contrast</p>
    </div>
  );
}
