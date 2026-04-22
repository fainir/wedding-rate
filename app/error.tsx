"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary — must be a Client Component.
 * Keeps language-neutral bilingual text so it works even if context fails.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[wedding-rate] Unhandled error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-wedding-text mb-2">
          Something went wrong · משהו השתבש
        </h1>
        <p className="text-wedding-muted mb-6 text-sm max-w-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors text-sm"
          >
            Try again · נסה שוב
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-gold-400 text-gold-700 font-semibold rounded-full hover:bg-gold-50 transition-colors text-sm"
          >
            Home · בית
          </a>
        </div>
      </body>
    </html>
  );
}
