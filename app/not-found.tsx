import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Compass className="mb-4 text-gold-400" size={32} strokeWidth={1.25} />
      <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400">Uncharted</p>
      <h1 className="mt-2 font-display text-3xl text-parchment-100">This page isn&apos;t on the map</h1>
      <p className="mt-3 max-w-sm text-sm text-stone-400">
        Whatever you were looking for doesn&apos;t exist here, or hasn&apos;t been charted yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink-950 hover:opacity-90"
      >
        Return to the Atlas
      </Link>
    </main>
  );
}
