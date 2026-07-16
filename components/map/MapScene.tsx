"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import { Terrain } from "./Terrain";
import { PinLayer } from "./PinLayer";
import { HudTracker } from "./HudTracker";
import { useHeightmap } from "@/lib/hooks/useHeightmap";
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

function SceneContents({ world, locations, editable, initialSelectedSlug, highlightUv }: MapSceneProps) {
  const heightmap = useHeightmap(world.heightmapUrl);
  const overlayTexture = useOverlayTexture(world.overlayUrl);
  const showOverlay = useMapStore((s) => s.showOverlay);
  const placingPin = useMapStore((s) => s.placingPin);
  const setPendingPin = useMapStore((s) => s.setPendingPin);
  const setSelected = useMapStore((s) => s.setSelected);
  const controlsRef = useRef<MapControlsImpl | null>(null);

  useEffect(() => {
    if (initialSelectedSlug) setSelected(initialSelectedSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedSlug]);

  if (!heightmap) return null;

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-8, 14, 6]} intensity={0.6} />

      <Terrain
        heightmap={heightmap}
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
        heightmap={heightmap}
        widthUnits={world.mapWidthUnits}
        depthUnits={world.mapDepthUnits}
        maxElevationUnits={world.maxElevationUnits}
      />

      <MapControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={18}
        maxDistance={95}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI * 0.42}
        target={[0, 0, 0]}
      />
      <HudTracker controlsRef={controlsRef} />
    </>
  );
}

export default function MapScene(props: MapSceneProps) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      camera={{ position: [0, 48, 42], fov: 42, near: 0.5, far: 300 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b1520"]} />
      <fog attach="fog" args={["#0b1520", 90, 210]} />
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  );
}
