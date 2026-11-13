import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiveclicks | Free Website SEO & AEO Audit Tool",
  description:
    "Analyze your website for Google SEO and modern AI Search Optimization (AEO - ChatGPT, Perplexity, Claude, AI Overviews). Get an instant score and download your free comprehensive PDF audit.",
  keywords: [
    "SEO checker",
    "AEO checker",
    "Answer Engine Optimization",
    "AI Search Audit",
    "Website audit tool",
    "Free SEO score",
    "Hiveclicks",
  ],
  openGraph: {
    title: "Hiveclicks Free SEO & AEO Checker",
    description:
      "Is your website ready for Google and AI Search Engines? Audit your SEO & AEO scores in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black py-2 px-4 text-center text-xs font-semibold tracking-wide">
          ✨ Brand New: Full AEO (Answer Engine Optimization) & AI Search Audit Included
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-md group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  HIVECLICKS
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase -mt-1">
                  Search & AI Growth
                </span>
              </div>
            </a>

            {/* Navigation & Action Button */}
            <div className="flex items-center gap-4">
              <a
                href="#features"
                className="hidden md:inline-flex text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Why AEO?
              </a>
              <a
                href="/admin"
                className="hidden sm:inline-flex text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
              >
                Leads Admin
              </a>
              <a
                href="#audit-tool"
                id="btn-free-seo-checker"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                Free SEO & AEO Checker
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-white/10 bg-[#070a11] py-10 px-4 mt-20 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="font-bold text-white text-base">HIVECLICKS</span>
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  Lead Gen Audit Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Supercharge your website with dual SEO and Answer Engine Optimization (AEO) audits. Turn organic and generative AI visitors into high-value leads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-xs">
              <a href="#audit-tool" className="hover:text-amber-400 transition-colors">
                Run Free Audit
              </a>
              <a href="/admin" className="hover:text-amber-400 transition-colors">
                Admin Portal
              </a>
              <span className="text-slate-500">
                © {new Date().getFullYear()} Hiveclicks. All rights reserved.
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
