"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { MapControls, Html } from "@react-three/drei";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Starfield } from "./Starfield";
import { Nebulae } from "./Nebulae";
import {
  generateGalaxyStars,
  generateSystems,
  GALAXY_RADIUS,
  type StarSystemSummary,
} from "@/lib/galaxy/generator";
import { createGlowTexture } from "@/lib/galaxy/planetTexture";

interface GalaxySceneProps {
  galaxySeed: number;
  homeSystemId: string;
  worldName: string;
}

/** Zoom multiplier past the initial contain-fit at which system names appear. */
const LABEL_REVEAL_ZOOM_FACTOR = 1.9;

/**
 * Contain-fit the whole galaxy disc on any screen, so the first thing anyone
 * sees is the full spiral. (The atlas map cover-fits instead; a galaxy wants
 * to be seen whole.) Bounds derive from the mount-time viewport; the camera
 * itself is only touched inside useFrame, where imperative three access lives.
 */
function useContainFraming() {
  const size = useThree((state) => state.size);
  // Freeze the framing at mount: resizing reveals more/less sky at constant zoom.
  const [bounds] = useState(() => {
    const diameter = GALAXY_RADIUS * 2 * 1.1;
    const initial = Math.min(size.width, size.height) / diameter;
    return { initial, min: initial * 0.85, max: initial * 14 };
  });
  const applied = useRef(false);

  useFrame(({ camera }) => {
    if (applied.current || !(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom = bounds.initial;
    camera.updateProjectionMatrix();
    applied.current = true;
  });

  return bounds;
}

function SystemMarker({
  system,
  isHome,
  worldName,
  labelsVisible,
  glowTexture,
  homeGlowTexture,
}: {
  system: StarSystemSummary;
  isHome: boolean;
  worldName: string;
  labelsVisible: boolean;
  glowTexture: THREE.Texture;
  homeGlowTexture: THREE.Texture;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const scale = system.size * (hovered ? 4.4 : 3.4);

  useFrame((state) => {
    if (!ringRef.current) return;
    // Slow breathing beacon on the home system.
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12;
    ringRef.current.scale.setScalar(pulse * system.size * 2.4);
  });

  const showLabel = labelsVisible || hovered || isHome;

  return (
    <group position={[system.x, 0, system.z]}>
      <sprite
        scale={[scale, scale, 1]}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/galaxy/${system.id}`);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <spriteMaterial
          map={isHome ? homeGlowTexture : glowTexture}
          color={system.color}
          transparent
          opacity={hovered ? 1 : 0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {isHome && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.86, 0.95, 48]} />
          <meshBasicMaterial color="#e3b45c" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {showLabel && (
        <Html position={[0, 0, system.size * 1.9]} center zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/galaxy/${system.id}`);
            }}
            className="pointer-events-auto flex -translate-y-1 flex-col items-center gap-0.5 whitespace-nowrap"
          >
            <span
              className={`font-display text-[11px] tracking-[0.22em] uppercase transition-colors ${
                hovered ? "text-gold-300" : isHome ? "text-gold-400" : "text-stone-300/90"
              }`}
              style={{ textShadow: "0 0 10px rgba(7, 12, 18, 0.9), 0 0 22px rgba(7, 12, 18, 0.7)" }}
            >
              {system.name}
            </span>
            {isHome && (
              <span className="text-[9px] uppercase tracking-[0.18em] text-gold-500/80">{worldName}</span>
            )}
          </button>
        </Html>
      )}
    </group>
  );
}

function SceneContents({ galaxySeed, homeSystemId, worldName }: GalaxySceneProps) {
  const stars = useMemo(() => generateGalaxyStars(galaxySeed), [galaxySeed]);
  const systems = useMemo(() => generateSystems(galaxySeed), [galaxySeed]);
  const glowTexture = useMemo(() => createGlowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0.32)"), []);
  const homeGlowTexture = useMemo(() => createGlowTexture("rgba(255,244,218,1)", "rgba(227,180,92,0.5)"), []);

  const framing = useContainFraming();
  const controlsRef = useRef<MapControlsImpl | null>(null);
  const [labelsVisible, setLabelsVisible] = useState(false);

  useFrame(({ camera }) => {
    if (!framing) return;
    const next = camera.zoom >= framing.initial * LABEL_REVEAL_ZOOM_FACTOR;
    if (next !== labelsVisible) setLabelsVisible(next);
  });

  if (!framing) return null;

  return (
    <>
      <Starfield stars={stars} />
      <Nebulae seed={galaxySeed} />

      {systems.map((system) => (
        <SystemMarker
          key={system.id}
          system={system}
          isHome={system.id === homeSystemId}
          worldName={worldName}
          labelsVisible={labelsVisible}
          glowTexture={glowTexture}
          homeGlowTexture={homeGlowTexture}
        />
      ))}

      <MapControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        screenSpacePanning={false}
        minZoom={framing.min}
        maxZoom={framing.max}
        minPolarAngle={0.0001}
        maxPolarAngle={0.0001}
        dampingFactor={0.12}
        zoomSpeed={1.1}
      />
    </>
  );
}

export default function GalaxyScene(props: GalaxySceneProps) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      camera={{ position: [0, 120, 0], up: [0, 0, -1], near: 1, far: 500 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="touch-none"
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
