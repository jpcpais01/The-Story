"use client";

import { create } from "zustand";

interface PendingPin {
  u: number;
  v: number;
}

interface MapStore {
  selectedSlug: string | null;
  setSelected: (slug: string | null) => void;

  placingPin: boolean;
  setPlacingPin: (value: boolean) => void;

  pendingPin: PendingPin | null;
  setPendingPin: (pin: PendingPin | null) => void;

  captureRequestId: number;
  requestMapCapture: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedSlug: null,
  setSelected: (slug) => set({ selectedSlug: slug }),

  placingPin: false,
  setPlacingPin: (value) => set({ placingPin: value, pendingPin: null }),

  pendingPin: null,
  setPendingPin: (pin) => set({ pendingPin: pin }),

  captureRequestId: 0,
  requestMapCapture: () => set((s) => ({ captureRequestId: s.captureRequestId + 1 })),
}));
