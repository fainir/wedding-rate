"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { t, lang, toggleLang, isRtl } = useLanguage();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-ivory border-b border-wedding-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <span className="text-2xl">💍</span>
          <span
            className="font-bold text-gold-700 tracking-wide hidden sm:block"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Wedding Rate
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/create" onClick={() => setMenuOpen(false)}>
            {t.nav.createWedding}
          </NavLink>
          {!loading && user ? (
            <>
              <NavLink href="/my-reviews" onClick={() => setMenuOpen(false)}>
                {t.nav.myReviews}
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-wedding-muted hover:text-gold-700 rounded-lg hover:bg-gold-50 transition-colors"
              >
                {t.nav.logout}
              </button>
            </>
          ) : !loading ? (
            <>
              <NavLink href="/login" onClick={() => setMenuOpen(false)}>
                {t.nav.login}
              </NavLink>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-semibold bg-gold-500 text-white rounded-full hover:bg-gold-600 transition-colors"
              >
                {t.nav.register}
              </Link>
            </>
          ) : null}

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="ms-2 px-3 py-1.5 text-sm font-medium border border-wedding-border rounded-full text-wedding-muted hover:border-gold-400 hover:text-gold-700 transition-colors"
            aria-label="Toggle language"
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
        </nav>

        {/* Mobile: lang toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 text-sm border border-wedding-border rounded-full text-wedding-muted"
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-gold-50"
            aria-label="Menu"
          >
            <svg
              className="w-5 h-5 text-wedding-text"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-wedding-border bg-ivory px-4 py-3 flex flex-col gap-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <MobileNavLink href="/create" onClick={() => setMenuOpen(false)}>
            {t.nav.createWedding}
          </MobileNavLink>
          {!loading && user ? (
            <>
              <MobileNavLink href="/my-reviews" onClick={() => setMenuOpen(false)}>
                {t.nav.myReviews}
              </MobileNavLink>
              <button
                onClick={handleLogout}
                className="w-full text-start px-3 py-2 text-sm text-wedding-muted rounded-lg hover:bg-gold-50"
              >
                {t.nav.logout}
              </button>
            </>
          ) : !loading ? (
            <>
              <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>
                {t.nav.login}
              </MobileNavLink>
              <MobileNavLink href="/register" onClick={() => setMenuOpen(false)}>
                {t.nav.register}
              </MobileNavLink>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-1.5 text-sm text-wedding-muted hover:text-gold-700 rounded-lg hover:bg-gold-50 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-wedding-text rounded-lg hover:bg-gold-50"
    >
      {children}
    </Link>
  );
}
