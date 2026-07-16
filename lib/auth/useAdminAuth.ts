"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface AdminAuthState {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
}

/**
 * In dev-store mode (no Firebase project configured yet) there's no real
 * backend to protect, so the admin panel is treated as already-signed-in --
 * that's what lets you build/test the whole admin flow before you've created
 * your Firebase project. Once Firebase is configured, this checks the real
 * signed-in user's `admin` custom claim (see scripts/set-admin-claim.mjs).
 */
export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    loading: isFirebaseConfigured,
    user: null,
    isAdmin: !isFirebaseConfigured,
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, user: null, isAdmin: false });
        return;
      }
      const token = await user.getIdTokenResult();
      setState({ loading: false, user, isAdmin: token.claims.admin === true });
    });
  }, []);

  return state;
}
