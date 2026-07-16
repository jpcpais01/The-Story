"use client";

import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

/**
 * Tells the server to drop cached copies of the given tags after an admin write.
 * No-op in dev-store mode, where server reads hit the in-memory store directly
 * (nothing is cached, so nothing needs invalidating).
 */
export async function revalidateTags(tags: string[]): Promise<void> {
  if (!isFirebaseConfigured || !auth?.currentUser) return;
  const idToken = await auth.currentUser.getIdToken();
  await fetch("/api/revalidate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags }),
  }).catch(() => {
    /* best-effort: public pages still self-heal after the TTL */
  });
}
