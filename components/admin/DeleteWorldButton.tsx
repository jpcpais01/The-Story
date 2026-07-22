"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteWorld } from "@/lib/firestore/world.client";

export function DeleteWorldButton({ worldId, worldName }: { worldId: string; worldName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteWorld(worldId);
      router.push("/admin/world");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 rounded-full border border-red-400/20 px-3 py-1.5 text-xs font-medium text-red-300/80 transition-colors hover:border-red-400/50 hover:text-red-300"
      >
        <Trash2 size={13} />
        Delete world
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-300/90">Delete “{worldName}” forever?</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200"
      >
        Cancel
      </button>
    </div>
  );
}
