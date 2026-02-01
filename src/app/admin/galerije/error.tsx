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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-light text-white">
          Greška u admin panelu
        </h1>
        <p className="mb-6 text-neutral-400">
          Došlo je do greške. Molimo pokušajte ponovo.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
        >
          Pokušaj ponovo
        </button>
      </div>
    </div>
  );
}
