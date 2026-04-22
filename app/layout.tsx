import type { Metadata } from "next";
import { Playfair_Display, Lato, Heebo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import type { Language } from "@/lib/translations";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Rate | דרג את ספקי החתונה",
  description:
    "Rate your wedding vendors and help other couples make the best choice.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("wr-lang")?.value as Language) ?? "he";

  return (
    <html
      lang={lang}
      dir={lang === "he" ? "rtl" : "ltr"}
      className={`${playfair.variable} ${lato.variable} ${heebo.variable}`}
    >
      <body className="min-h-screen bg-ivory">
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
