import { cookies } from "next/headers";
import { translations, type Language, type Translations } from "./translations";

/**
 * Server-Component helper — reads the `wr-lang` cookie and returns the
 * matching translation object so Server Components can render in Hebrew or
 * English without relying on client-side LanguageContext.
 *
 * Usage:
 * ```ts
 * const { t, lang } = await getServerT();
 * ```
 */
export async function getServerT(): Promise<{
  t: Translations;
  lang: Language;
}> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("wr-lang")?.value as Language) ?? "he";
  return { t: translations[lang], lang };
}
