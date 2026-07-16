"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { TerrainMaterialImpl } from "./terrainMaterial";
import { sampleHeight, type HeightmapData } from "@/lib/terrain/heightSampler";
import { toUv } from "@/lib/terrain/coords";

export interface SurfacePoint {
  u: number;
  v: number;
  elevation: number;
  worldPosition: THREE.Vector3;
}

interface TerrainProps {
  heightmap: HeightmapData;
  temperatureMap: HeightmapData;
  humidityMap: HeightmapData;
  widthUnits: number;
  depthUnits: number;
  maxElevationUnits: number;
  seaLevel: number;
  contourIntervalCount: number;
  overlayTexture?: THREE.Texture | null;
  overlayOpacity?: number;
  segments?: number;
  highlightUv?: { u: number; v: number; radius: number } | null;
  onSurfaceClick?: (point: SurfacePoint) => void;
}

export function Terrain({
  heightmap,
  temperatureMap,
  humidityMap,
  widthUnits,
  depthUnits,
  maxElevationUnits,
  seaLevel,
  contourIntervalCount,
  overlayTexture = null,
  overlayOpacity = 0,
  segments = 256,
  highlightUv = null,
  onSurfaceClick,
}: TerrainProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(widthUnits, depthUnits, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const elevation = new Float32Array(pos.count);
    const temperature = new Float32Array(pos.count);
    const humidity = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const { u, v } = toUv(pos.getX(i), pos.getZ(i), widthUnits, depthUnits);
      const h = sampleHeight(heightmap, u, v);
      pos.setY(i, h * maxElevationUnits);
      elevation[i] = h;
      temperature[i] = sampleHeight(temperatureMap, u, v);
      humidity[i] = sampleHeight(humidityMap, u, v);
    }
    geo.setAttribute("elevation", new THREE.BufferAttribute(elevation, 1));
    geo.setAttribute("temperature", new THREE.BufferAttribute(temperature, 1));
    geo.setAttribute("humidity", new THREE.BufferAttribute(humidity, 1));
    geo.computeVertexNormals();
    return geo;
  }, [heightmap, temperatureMap, humidityMap, widthUnits, depthUnits, maxElevationUnits, segments]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Mutated imperatively below via uniform properties -- the standard three.js/R3F
  // pattern (drei's own material helpers do the same). See eslint.config.mjs for
  // why react-hooks/immutability is disabled in this directory.
  // `transparent: true` is required for the ragged border-erosion alpha mask.
  const material = useMemo(() => new TerrainMaterialImpl({ transparent: true }), []);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.seaLevel = seaLevel;
    material.contourCount = contourIntervalCount;
    material.overlayMap = overlayTexture;
    material.hasOverlay = Boolean(overlayTexture);
    material.overlayOpacity = overlayTexture ? overlayOpacity : 0;
    material.mapAspect = widthUnits / depthUnits;
    material.highlightUv = highlightUv
      ? new THREE.Vector3(highlightUv.u, highlightUv.v, highlightUv.radius)
      : new THREE.Vector3(0, 0, -1);
  }, [material, seaLevel, contourIntervalCount, overlayTexture, overlayOpacity, widthUnits, depthUnits, highlightUv]);

  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (!onSurfaceClick) return;
    event.stopPropagation();
    const { u, v } = toUv(event.point.x, event.point.z, widthUnits, depthUnits);
    onSurfaceClick({ u, v, elevation: sampleHeight(heightmap, u, v), worldPosition: event.point.clone() });
  }

  return (
    <mesh geometry={geometry} onClick={onSurfaceClick ? handleClick : undefined}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}
