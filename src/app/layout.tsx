import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AmadursInsight — Notes to Requirements",
  description:
    "Turn messy stakeholder meeting notes into a structured, linked requirements draft — and see what breaks when a requirement changes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-baseline gap-2 no-underline">
              <span className="font-display text-[0.95rem] font-bold tracking-tight text-ink">
                Amadurs<span className="text-accent-ink">Insight</span>
              </span>
              <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint min-[420px]:inline">
                notes &rarr; requirements
              </span>
            </Link>
            <Link
              href="/about"
              className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-soft underline-offset-4 hover:text-accent-ink hover:underline"
            >
              Design decisions
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
