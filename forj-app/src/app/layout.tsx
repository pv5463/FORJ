import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FORJ — Proof-to-Opportunity Platform",
    template: "%s | FORJ",
  },
  description:
    "FORJ connects students and early-career talent with opportunities through evidence-backed skill challenges, AI-assisted matching, and transparent proof of work.",
  keywords: ["jobs", "internships", "startup", "students", "talent", "opportunities", "India"],
  openGraph: {
    title: "FORJ — Proof-to-Opportunity Platform",
    description: "Earn your next opportunity through proof of work, not promises.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
