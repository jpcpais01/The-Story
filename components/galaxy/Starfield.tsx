"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyStars } from "@/lib/galaxy/generator";

/**
 * One draw call for every background star. A tiny shader varies each point's
 * brightness on a per-star phase so the field twinkles without any per-frame
 * JS or geometry updates -- this is what keeps the screen fast on phones.
 */

const VERT = /* glsl */ `
  attribute float phase;
  attribute float size;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = color;
    vTwinkle = 0.72 + 0.28 * sin(uTime * 0.9 + phase);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uScale;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    // Round, soft-edged point.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float alpha = smoothstep(1.0, 0.28, d);
    gl_FragColor = vec4(vColor * vTwinkle, alpha);
  }
`;

interface StarfieldProps {
  stars: GalaxyStars;
  /** Base point size in device pixels. */
  pointScale?: number;
}

export function Starfield({ stars, pointScale = 2.6 }: StarfieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(stars.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(stars.colors, 3));
    geo.setAttribute("phase", new THREE.BufferAttribute(stars.phases, 1));
    geo.setAttribute("size", new THREE.BufferAttribute(stars.sizes, 1));
    return geo;
  }, [stars]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: pointScale * Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio) },
    }),
    [pointScale]
  );

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
