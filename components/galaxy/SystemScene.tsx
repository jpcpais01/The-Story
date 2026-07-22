"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { Compass, Moon as MoonIcon } from "lucide-react";
import { Starfield } from "./Starfield";
import { generateSystem, type PlanetSpec, type SystemSpec } from "@/lib/galaxy/generator";
import { createPlanetTexture, createRingTexture, createGlowTexture } from "@/lib/galaxy/planetTexture";
import { mulberry32 } from "@/lib/terrain/random";
import type { GalaxyStars } from "@/lib/galaxy/generator";

interface SystemSceneProps {
  systemSeed: number;
  systemName: string;
  /** The Atlas world's name when this is the home system, else null. */
  homeWorldName: string | null;
}

const ARCHETYPE_LABELS: Record<PlanetSpec["archetype"], string> = {
  rocky: "Barren world",
  terra: "Living world",
  gas: "Gas giant",
  ice: "Frozen world",
  lava: "Molten world",
};

/** Sparse shell of distant stars wrapping the system, reusing the Starfield shader. */
function useBackdropStars(seed: number, radius: number): GalaxyStars {
  return useMemo(() => {
    const rand = mulberry32((seed ^ 0x27d4eb2f) >>> 0);
    const COUNT = 2600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const phases = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // Uniform direction on a sphere; radius jittered so it isn't a hard shell.
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = radius * (5.5 + rand() * 3.5);
      positions[i * 3] = s * Math.cos(theta) * r;
      positions[i * 3 + 1] = u * r;
      positions[i * 3 + 2] = s * Math.sin(theta) * r;
      const b = 0.3 + rand() * 0.7;
      const warm = rand() < 0.18;
      colors[i * 3] = b;
      colors[i * 3 + 1] = b * (warm ? 0.86 : 0.95);
      colors[i * 3 + 2] = b * (warm ? 0.65 : 1);
      phases[i] = rand() * Math.PI * 2;
      sizes[i] = 0.5 + rand() * 1.1;
    }
    return { positions, colors, phases, sizes };
  }, [seed, radius]);
}

function Sun({ system }: { system: SystemSpec }) {
  const glow = useMemo(
    () => createGlowTexture("rgba(255, 252, 240, 1)", "rgba(255, 214, 140, 0.36)"),
    []
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[system.starRadius, 40, 28]} />
        <meshBasicMaterial color={system.starColor} />
      </mesh>
      <sprite scale={[system.starRadius * 7, system.starRadius * 7, 1]}>
        <spriteMaterial map={glow} color={system.starColor} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight color={system.starColor} intensity={5} decay={0.28} />
      <ambientLight intensity={0.32} />
    </group>
  );
}

/** Ring geometry with UVs remapped so v runs radially -- lets one 1D-striped texture band the ring. */
function useRadialRingGeometry(inner: number, outer: number) {
  return useMemo(() => {
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const span = outer - inner;
    for (let i = 0; i < pos.count; i++) {
      const d = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, 0.5, (d - inner) / span);
    }
    uv.needsUpdate = true;
    return geo;
  }, [inner, outer]);
}

function PlanetRings({ planet }: { planet: PlanetSpec }) {
  const rings = planet.rings!;
  const geometry = useRadialRingGeometry(rings.inner, rings.outer);
  const texture = useMemo(() => createRingTexture(planet.textureSeed, rings.color), [planet.textureSeed, rings.color]);
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={texture} transparent opacity={rings.opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Planet({
  planet,
  selected,
  onSelect,
}: {
  planet: PlanetSpec;
  selected: boolean;
  onSelect: (name: string | null) => void;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const homeRingRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => createPlanetTexture(planet), [planet]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbitRef.current) {
      const angle = planet.phase + t * planet.orbitSpeed;
      orbitRef.current.position.set(
        Math.cos(angle) * planet.orbitRadius,
        0,
        Math.sin(angle) * planet.orbitRadius
      );
    }
    if (spinRef.current) spinRef.current.rotation.y = t * planet.spinSpeed;
    if (homeRingRef.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.09;
      homeRingRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={orbitRef}>
      <group rotation={[0, 0, planet.axialTilt]}>
        <mesh
          ref={spinRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selected ? null : planet.name);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <sphereGeometry args={[planet.radius, 40, 28]} />
          <meshStandardMaterial map={texture} roughness={1} metalness={0} />
        </mesh>
        {planet.rings && <PlanetRings planet={planet} />}
      </group>

      {planet.isHomeWorld && (
        <mesh ref={homeRingRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.55, planet.radius * 1.68, 48]} />
          <meshBasicMaterial color="#e3b45c" transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {planet.moons.map((moon) => (
        <MoonNode key={moon.name} moon={moon} />
      ))}

      {selected && (
        <Html position={[0, planet.radius + 0.6, 0]} center zIndexRange={[20, 0]}>
          <div className="pointer-events-auto w-56 -translate-y-full overflow-hidden rounded-xl border border-white/15 bg-stone-950/90 text-left shadow-2xl backdrop-blur-md">
            <div className="p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-display text-sm font-semibold text-amber-200">{planet.name}</p>
                <p className="shrink-0 text-[10px] text-stone-400">{ARCHETYPE_LABELS[planet.archetype]}</p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-300">
                <MoonIcon size={11} className="text-stone-500" />
                {planet.moons.length === 0
                  ? "No moons"
                  : `${planet.moons.length} moon${planet.moons.length > 1 ? "s" : ""}`}
                {planet.rings && " · Ringed"}
              </p>
              {planet.isHomeWorld && (
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 px-3 py-1.5 text-xs font-medium text-gold-300 transition-colors hover:border-gold-300 hover:text-gold-200"
                >
                  <Compass size={12} />
                  Enter the Atlas
                </Link>
              )}
            </div>
          </div>
        </Html>
      )}

      {planet.isHomeWorld && !selected && (
        <Html position={[0, -(planet.radius + 0.7), 0]} center zIndexRange={[10, 0]}>
          <p
            className="pointer-events-none whitespace-nowrap font-display text-[10px] uppercase tracking-[0.25em] text-gold-400"
            style={{ textShadow: "0 0 10px rgba(7,12,18,0.9)" }}
          >
            {planet.name}
          </p>
        </Html>
      )}
    </group>
  );
}

function MoonNode({ moon }: { moon: PlanetSpec["moons"][number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const angle = moon.phase + state.clock.elapsedTime * moon.orbitSpeed;
    ref.current.position.set(Math.cos(angle) * moon.orbitRadius, 0, Math.sin(angle) * moon.orbitRadius);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[moon.radius, 16, 12]} />
        <meshStandardMaterial color={moon.color} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function OrbitLine({ radius, isHome }: { radius: number; isHome: boolean }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);
  return (
    <Line
      points={points}
      color={isHome ? "#e3b45c" : "#ffffff"}
      transparent
      opacity={isHome ? 0.28 : 0.09}
      lineWidth={1}
    />
  );
}

function SceneContents({ systemSeed, systemName, homeWorldName }: SystemSceneProps) {
  const system = useMemo(
    () => generateSystem(systemSeed, systemName, homeWorldName),
    [systemSeed, systemName, homeWorldName]
  );
  const extent = useMemo(
    () => Math.max(...system.planets.map((p) => p.orbitRadius)) + 6,
    [system]
  );
  const backdrop = useBackdropStars(systemSeed, extent);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const camera = useThree((state) => state.camera);

  // Frame the whole system whatever its size: bigger systems start farther out.
  useEffect(() => {
    camera.position.set(0, extent * 0.55, extent * 1.15);
    camera.lookAt(0, 0, 0);
    // Frame once per system; user zoom/orbit owns the camera afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extent]);

  return (
    <>
      <Starfield stars={backdrop} pointScale={2.1} />
      <Sun system={system} />

      {system.planets.map((planet) => (
        <OrbitLine key={`orbit-${planet.name}`} radius={planet.orbitRadius} isHome={planet.isHomeWorld} />
      ))}
      {system.planets.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          selected={selectedName === planet.name}
          onSelect={setSelectedName}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={extent * 0.18}
        maxDistance={extent * 2.4}
        maxPolarAngle={Math.PI * 0.52}
        onStart={() => setSelectedName(null)}
      />
    </>
  );
}

export default function SystemScene(props: SystemSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 34, 62], fov: 42, near: 0.1, far: 4000 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="touch-none"
      onPointerMissed={() => undefined}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
