"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Terrain } from "./Terrain";
import { PinLayer } from "./PinLayer";
import { HudTracker } from "./HudTracker";
import { MapCaptureHandler } from "./MapCaptureHandler";
import { useTerrainData } from "@/lib/hooks/useTerrainData";
import { useOverlayTexture } from "@/lib/hooks/useOverlayTexture";
import { useMapStore } from "@/lib/store/mapStore";
import type { WorldDoc, LocationDoc } from "@/types/firestore";

interface MapSceneProps {
  world: WorldDoc;
  locations: LocationDoc[];
  editable: boolean;
  initialSelectedSlug?: string | null;
  highlightUv?: { u: number; v: number } | null;
}

// Fully top-down: lock the camera's tilt to (effectively) zero. A true 0 would
// put OrbitControls' spherical math at a singularity, so we use a hair above it.
const TOP_DOWN_POLAR_ANGLE = 0.0001;

interface ZoomBounds {
  initial: number;
  min: number;
  max: number;
}

/** Computes an orthographic zoom so `desiredVisibleWidth` world units are framed on load. */
function useTopDownFraming(desiredVisibleWidth: number): ZoomBounds | null {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const [bounds, setBounds] = useState<ZoomBounds | null>(null);

  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const initial = size.width / desiredVisibleWidth;
    camera.zoom = initial;
    camera.updateProjectionMatrix();
    // Synchronizing with an external system (the three.js camera) -- bounds
    // derive from the same one-time measurement, so they're set here too.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBounds({ initial, min: initial * 0.35, max: initial * 8 });
    // Only frame once on mount -- resizing the window should reveal more/less
    // map at a constant zoom level, like any map app, not rescale the world.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return bounds;
}

function SceneContents({ world, locations, editable, initialSelectedSlug, highlightUv }: MapSceneProps) {
  const aspectRatio = world.mapWidthUnits / world.mapDepthUnits;
  const detail = useMemo(
    () => ({
      detailWeight: world.terrainDetailWeight,
      detailFrequency: world.terrainDetailFrequency,
      detailOctaves: world.terrainDetailOctaves,
      detailLacunarity: world.terrainDetailLacunarity,
    }),
    [world.terrainDetailWeight, world.terrainDetailFrequency, world.terrainDetailOctaves, world.terrainDetailLacunarity]
  );
  const terrain = useTerrainData(world.heightmapUrl, world.heightmapSeed, world.seaLevel, aspectRatio, detail);
  const overlayTexture = useOverlayTexture(world.overlayUrl);
  const showOverlay = useMapStore((s) => s.showOverlay);
  const placingPin = useMapStore((s) => s.placingPin);
  const setPendingPin = useMapStore((s) => s.setPendingPin);
  const setSelected = useMapStore((s) => s.setSelected);
  const controlsRef = useRef<MapControlsImpl | null>(null);
  const framing = useTopDownFraming(Math.max(world.mapWidthUnits, world.mapDepthUnits) * 1.3);

  useEffect(() => {
    if (initialSelectedSlug) setSelected(initialSelectedSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedSlug]);

  if (!terrain || !framing) return null;

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-8, 14, 6]} intensity={0.6} />

      <Terrain
        heightmap={terrain.elevation}
        temperatureMap={terrain.temperature}
        humidityMap={terrain.humidity}
        widthUnits={world.mapWidthUnits}
        depthUnits={world.mapDepthUnits}
        maxElevationUnits={world.maxElevationUnits}
        seaLevel={world.seaLevel}
        contourIntervalCount={world.contourIntervalCount}
        overlayTexture={world.overlayUrl && showOverlay ? overlayTexture : null}
        overlayOpacity={1}
        highlightUv={highlightUv ? { ...highlightUv, radius: 0.035 } : null}
        onSurfaceClick={
          editable && placingPin
            ? (point) => setPendingPin({ u: point.u, v: point.v })
            : undefined
        }
      />

      <PinLayer
        locations={locations}
        heightmap={terrain.elevation}
        widthUnits={world.mapWidthUnits}
        depthUnits={world.mapDepthUnits}
        maxElevationUnits={world.maxElevationUnits}
      />

      <MapControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minZoom={framing.min}
        maxZoom={framing.max}
        minPolarAngle={TOP_DOWN_POLAR_ANGLE}
        maxPolarAngle={TOP_DOWN_POLAR_ANGLE}
        target={[0, 0, 0]}
      />
      <HudTracker controlsRef={controlsRef} />
      <MapCaptureHandler controlsRef={controlsRef} fitZoom={framing.initial} worldName={world.name} />
    </>
  );
}

export default function MapScene(props: MapSceneProps) {
  return (
    <Canvas
      orthographic
      shadows={false}
      dpr={[1, 2]}
      camera={{ position: [0, 60, 0.01], zoom: 10, near: 0.1, far: 500 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#0b1520"]} />
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  );
}
