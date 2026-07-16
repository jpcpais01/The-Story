"use client";

import { create } from "zustand";

interface PendingPin {
  u: number;
  v: number;
}

interface MapStore {
  selectedSlug: string | null;
  setSelected: (slug: string | null) => void;

  showOverlay: boolean;
  toggleOverlay: () => void;

  placingPin: boolean;
  setPlacingPin: (value: boolean) => void;

  pendingPin: PendingPin | null;
  setPendingPin: (pin: PendingPin | null) => void;

  /** Camera heading in degrees (0 = north-up), updated from inside the Canvas. */
  compassHeading: number;
  /** Approximate world units visible per screen pixel, for the scale bar. */
  unitsPerPixel: number;
  setHudMetrics: (metrics: { compassHeading: number; unitsPerPixel: number }) => void;
  resetHeadingRequestId: number;
  requestResetHeading: () => void;

  captureRequestId: number;
  requestMapCapture: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedSlug: null,
  setSelected: (slug) => set({ selectedSlug: slug }),

  showOverlay: true,
  toggleOverlay: () => set((s) => ({ showOverlay: !s.showOverlay })),

  placingPin: false,
  setPlacingPin: (value) => set({ placingPin: value, pendingPin: null }),

  pendingPin: null,
  setPendingPin: (pin) => set({ pendingPin: pin }),

  compassHeading: 0,
  unitsPerPixel: 0,
  setHudMetrics: ({ compassHeading, unitsPerPixel }) => set({ compassHeading, unitsPerPixel }),
  resetHeadingRequestId: 0,
  requestResetHeading: () => set((s) => ({ resetHeadingRequestId: s.resetHeadingRequestId + 1 })),

  captureRequestId: 0,
  requestMapCapture: () => set((s) => ({ captureRequestId: s.captureRequestId + 1 })),
}));
