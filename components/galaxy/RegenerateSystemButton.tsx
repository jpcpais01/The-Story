"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { regenerateSystem } from "@/lib/firestore/galaxy.client";

/**
 * Admin-only: writes a fresh random seed override for this system, changing
 * its planets permanently (until the next regenerate). Everyone else keeps
 * seeing the exact same system forever.
 */
export function RegenerateSystemButton({ systemId }: { systemId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const onClick = async () => {
    setBusy(true);
    setError(false);
    try {
      await regenerateSystem(systemId);
      router.refresh();
    } catch {
      // Most likely: not signed in as admin (Firestore rules reject the write).
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/60 px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur transition-colors hover:border-gold-400/40 hover:text-gold-300 disabled:opacity-50"
      >
        <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
        Regenerate system
      </button>
      {error && (
        <p className="rounded-full bg-ink-950/80 px-3 py-1 text-[10px] text-red-300/90">
          Regeneration failed — are you signed in as admin?
        </p>
      )}
    </div>
  );
}
