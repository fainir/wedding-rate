import Link from "next/link";
import { getServerT } from "@/lib/serverTranslations";
import { Header } from "@/components/Header";

export default async function NotFound() {
  const { t } = await getServerT();

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">💍</div>
        <h1
          className="text-4xl font-bold text-wedding-text mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          404
        </h1>
        <p className="text-lg text-wedding-muted mb-8">
          {t.common.error} — page not found.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors"
        >
          ← {t.common.back}
        </Link>
      </main>
    </>
  );
}
