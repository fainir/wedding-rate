"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { CONTRACTOR_CATEGORIES } from "@/lib/translations";

interface ContractorEntry {
  category: string;
  name: string;
  description: string;
}

export default function CreatePage() {
  const { t, isRtl } = useLanguage();
  const { user, refresh } = useAuth();
  const router = useRouter();

  // Wedding fields
  const [coupleName, setCoupleName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");

  // Contractor builder
  const [contractors, setContractors] = useState<ContractorEntry[]>([]);
  const [newCategory, setNewCategory] = useState("photographer");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Optional account
  const [createAccount, setCreateAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addContractor() {
    if (!newName.trim()) return;
    setContractors((prev) => [
      ...prev,
      { category: newCategory, name: newName.trim(), description: newDesc.trim() },
    ]);
    setNewName("");
    setNewDesc("");
  }

  function removeContractor(i: number) {
    setContractors((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coupleName.trim() || contractors.length === 0) {
      setError(t.create.errorRequired);
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        coupleName: coupleName.trim(),
        weddingDate: weddingDate || null,
        location: location.trim() || null,
        contractors,
      };
      if (!user && createAccount && email && password && accountName) {
        body.account = { email, password, name: accountName };
      }

      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.create.errorServer);
        return;
      }

      if (body.account) await refresh();
      router.push(`/wedding/${data.slug}`);
    } catch {
      setError(t.create.errorServer);
    } finally {
      setSubmitting(false);
    }
  }

  const categoryEmoji: Record<string, string> = Object.fromEntries(
    CONTRACTOR_CATEGORIES.map((c) => [c.value, c.emoji])
  );

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
        <h1
          className="text-3xl font-bold text-wedding-text mb-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {t.create.title}
        </h1>
        <p className="text-wedding-muted mb-8 text-sm">
          {t.landing.hero.ctaSub}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Wedding details */}
          <section className="bg-white rounded-2xl border border-wedding-border p-6 space-y-4">
            <h2 className="font-semibold text-wedding-text text-lg">💍 Wedding Details</h2>

            <Field label={t.create.coupleNames} required>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder={t.create.coupleNamesPlaceholder}
                className={inputCls}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t.create.weddingDate}>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label={t.create.location}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.create.locationPlaceholder}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Vendors */}
          <section className="bg-white rounded-2xl border border-wedding-border p-6 space-y-4">
            <h2 className="font-semibold text-wedding-text text-lg">
              🎵 {t.create.addVendors}
            </h2>

            {/* Added vendors list */}
            {contractors.length > 0 && (
              <ul className="space-y-2">
                {contractors.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-ivory rounded-xl px-3 py-2 border border-wedding-border/60"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span>{categoryEmoji[c.category]}</span>
                      <span className="font-medium text-wedding-text">{c.name}</span>
                      <span className="text-wedding-muted text-xs">
                        ({t.categories[c.category]})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContractor(i)}
                      className="text-xs text-wedding-muted hover:text-red-500 transition-colors px-2"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add vendor form */}
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.create.category}>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={inputCls}
                >
                  {CONTRACTOR_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {t.categories[c.value]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.create.vendorName}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.create.vendorNamePlaceholder}
                  className={inputCls}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addContractor())}
                />
              </Field>
            </div>
            <Field label="Description (optional)">
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Studio name, style..."
                className={inputCls}
              />
            </Field>
            <button
              type="button"
              onClick={addContractor}
              disabled={!newName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-400 text-gold-700 text-sm font-medium hover:bg-gold-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              + {t.create.addVendor}
            </button>
          </section>

          {/* Optional account (only if not logged in) */}
          {!user && (
            <section className="bg-white rounded-2xl border border-wedding-border p-6 space-y-4">
              <button
                type="button"
                onClick={() => setCreateAccount((v) => !v)}
                className="flex items-center gap-3 w-full text-start"
              >
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    createAccount ? "bg-gold-500" : "bg-ivory-darker"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      createAccount ? "left-5" : "left-1"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-wedding-text text-sm">
                    {t.create.accountTitle}
                  </p>
                  <p className="text-xs text-wedding-muted">{t.create.accountDesc}</p>
                </div>
              </button>

              {createAccount && (
                <div className="space-y-3 pt-2 border-t border-wedding-border">
                  <Field label={t.create.accountName}>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.create.accountEmail}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.create.accountPassword}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}
            </section>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gold-500 text-white font-bold rounded-full hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-base shadow-md"
          >
            {submitting ? t.create.submitting : `💍 ${t.create.submit}`}
          </button>
        </form>
      </main>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-wedding-border bg-ivory px-3 py-2.5 text-sm text-wedding-text placeholder:text-wedding-muted/60 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-wedding-text">
        {label}
        {required && <span className="text-gold-600 ms-1">*</span>}
      </span>
      {children}
    </label>
  );
}
