import Link from "next/link";
import { Header } from "@/components/Header";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gold-50 to-ivory py-20 px-4 text-center">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none select-none"
          >
            <span className="absolute top-6 left-8 text-5xl opacity-20 rotate-12">🌸</span>
            <span className="absolute top-10 right-10 text-4xl opacity-20 -rotate-12">🌸</span>
            <span className="absolute bottom-6 left-1/4 text-3xl opacity-15 rotate-6">💮</span>
            <span className="absolute bottom-10 right-1/4 text-3xl opacity-15 -rotate-6">💮</span>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <p className="text-gold-600 font-medium tracking-widest text-sm uppercase mb-4">
              💍 Wedding Rate
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-wedding-text mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Rate Your{" "}
              <span className="text-gold-600">Wedding</span> Vendors
            </h1>
            <p className="text-lg text-wedding-muted max-w-xl mx-auto mb-8">
              Create a page for your wedding, share it with guests, and collect
              honest star ratings for every vendor — DJ, photographer, venue,
              and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create"
                className="px-8 py-3.5 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors shadow-lg text-base"
              >
                Create Your Wedding Page
              </Link>
              <span className="text-sm text-wedding-muted">
                Free · No login required for guests
              </span>
            </div>
          </div>
        </section>

        <div className="gold-divider" />

        {/* How it works */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-bold text-wedding-text text-center mb-12"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  emoji: "📝",
                  num: "1",
                  title: "Create Your Page",
                  desc: "Add your couple names, wedding date, and all your vendors in just a few minutes.",
                },
                {
                  emoji: "📲",
                  num: "2",
                  title: "Share With Guests",
                  desc: "Send your unique link via WhatsApp, email, or SMS to all your guests.",
                },
                {
                  emoji: "⭐",
                  num: "3",
                  title: "Collect Reviews",
                  desc: "Guests rate each vendor 1–5 stars and leave comments — no account needed.",
                },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center text-3xl mx-auto mb-3">
                    {step.emoji}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-wedding-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-wedding-muted text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 px-4 bg-gold-50 border-t border-wedding-border text-center">
          <p className="text-lg font-medium text-wedding-text mb-4">
            Ready to start collecting reviews?
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors shadow-md"
          >
            Get started — it&apos;s free
          </Link>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-wedding-border text-center">
        <p className="text-sm text-wedding-muted">
          © {new Date().getFullYear()} Wedding Rate · Made with ❤️ in Israel
        </p>
      </footer>
    </>
  );
}
