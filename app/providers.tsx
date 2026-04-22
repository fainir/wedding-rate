"use client";

import { useEffect } from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Language } from "@/lib/translations";

function HtmlDirSync() {
  const { lang } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);
  return null;
}

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Language;
}) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <AuthProvider>
        <HtmlDirSync />
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
