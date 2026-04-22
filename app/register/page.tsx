"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { t, isRtl } = useLanguage();
  const { refresh } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.auth.errorServer);
        return;
      }
      await refresh();
      router.push("/my-reviews");
    } catch {
      setError(t.auth.errorServer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main
        className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">💍</span>
            <h1
              className="text-2xl font-bold text-wedding-text mt-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {t.auth.registerTitle}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-wedding-border p-6 space-y-4"
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-wedding-text">
                {t.auth.name}
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                autoComplete="name"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-wedding-text">
                {t.auth.email}
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-wedding-text">
                {t.auth.password}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-500 text-white font-bold rounded-full hover:bg-gold-600 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? t.auth.registering : t.auth.register}
            </button>
          </form>

          <p className="text-center text-sm text-wedding-muted mt-4">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="text-gold-600 hover:text-gold-800 font-medium">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-wedding-border bg-ivory px-3 py-2.5 text-sm text-wedding-text focus:outline-none focus:border-gold-400 focus:bg-white transition-colors";
