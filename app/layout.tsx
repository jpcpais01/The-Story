import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getWorld } from "@/lib/firestore/world.server";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const world = await getWorld();
  return {
    title: { default: world.name, template: `%s · ${world.name}` },
    description: world.tagline,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const world = await getWorld();
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full bg-ink-900 text-stone-100 antialiased">
        <SiteHeader worldName={world.name} />
        {children}
      </body>
    </html>
  );
}
