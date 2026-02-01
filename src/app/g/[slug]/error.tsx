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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-light text-white">
          Došlo je do greške
        </h1>
        <p className="mb-6 text-neutral-400">
          Nismo uspeli da učitamo galeriju. Molimo pokušajte ponovo.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
        >
          Pokušaj ponovo
        </button>
      </div>
      <p className="mt-8 text-xs text-neutral-600">Studio Contrast</p>
    </div>
  );
}
