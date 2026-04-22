"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { translations, type Language, type Translations } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  t: Translations;
  toggleLang: () => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Language;
}) {
  const [lang, setLang] = useState<Language>(initialLang);

  const toggleLang = useCallback(() => {
    const next: Language = lang === "en" ? "he" : "en";
    setLang(next);
    document.cookie = `wr-lang=${next};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: translations[lang],
        toggleLang,
        isRtl: lang === "he",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
