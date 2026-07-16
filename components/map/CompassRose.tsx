"use client";

import { useMapStore } from "@/lib/store/mapStore";

export function CompassRose() {
  const heading = useMapStore((s) => s.compassHeading);
  const requestResetHeading = useMapStore((s) => s.requestResetHeading);

  return (
    <button
      type="button"
      onClick={requestResetHeading}
      title="Reset to north"
      aria-label="Reset map orientation to north"
      className="group flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-stone-950/60 shadow-lg backdrop-blur-md transition-transform hover:scale-105"
    >
      <svg
        viewBox="0 0 64 64"
        className="h-11 w-11 transition-transform duration-150 ease-out"
        style={{ transform: `rotate(${heading}deg)` }}
      >
        <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(238,233,224,0.18)" strokeWidth="1" />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          const major = i % 4 === 0;
          const r1 = major ? 22 : 25;
          const r2 = 29;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={32 + r1 * Math.sin(rad)}
              y1={32 - r1 * Math.cos(rad)}
              x2={32 + r2 * Math.sin(rad)}
              y2={32 - r2 * Math.cos(rad)}
              stroke="rgba(238,233,224,0.35)"
              strokeWidth={major ? 1.2 : 0.7}
            />
          );
        })}
        <polygon points="32,8 37,32 32,29 27,32" fill="#e3b45c" />
        <polygon points="32,56 37,32 32,35 27,32" fill="#8f8676" />
        <text x="32" y="14" textAnchor="middle" fontSize="8" fill="#f1cd80" fontWeight="600">
          N
        </text>
      </svg>
    </button>
  );
}
