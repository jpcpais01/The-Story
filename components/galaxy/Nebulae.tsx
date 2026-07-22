"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/terrain/random";
import { createGlowTexture } from "@/lib/galaxy/planetTexture";
import { GALAXY_RADIUS } from "@/lib/galaxy/generator";

/**
 * A handful of huge, faint additive sprites laid under the starfield -- reads
 * as nebular haze along the arms for almost zero cost.
 */

const TINTS: ReadonlyArray<[string, string]> = [
  ["rgba(96, 141, 204, 0.20)", "rgba(52, 84, 138, 0.07)"],
  ["rgba(120, 170, 210, 0.16)", "rgba(58, 96, 140, 0.06)"],
  ["rgba(214, 178, 110, 0.13)", "rgba(140, 104, 58, 0.05)"],
  ["rgba(150, 120, 200, 0.12)", "rgba(90, 70, 130, 0.05)"],
];

export function Nebulae({ seed }: { seed: number }) {
  const textures = useMemo(() => TINTS.map(([a, b]) => createGlowTexture(a, b)), []);

  const sprites = useMemo(() => {
    const rand = mulberry32((seed ^ 0xc2b2ae35) >>> 0);
    return Array.from({ length: 9 }, (_, i) => {
      const r = Math.pow(rand(), 0.6) * GALAXY_RADIUS * 0.8;
      const a = rand() * Math.PI * 2;
      return {
        key: i,
        position: [Math.cos(a) * r, -4 - rand() * 2, Math.sin(a) * r] as [number, number, number],
        scale: 30 + rand() * 55,
        textureIndex: Math.floor(rand() * textures.length),
        opacity: 0.5 + rand() * 0.5,
      };
    });
  }, [seed, textures.length]);

  return (
    <>
      {sprites.map((s) => (
        <sprite key={s.key} position={s.position} scale={[s.scale, s.scale, 1]}>
          <spriteMaterial
            map={textures[s.textureIndex]}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  );
}
