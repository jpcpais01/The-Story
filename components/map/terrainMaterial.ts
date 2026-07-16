import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

const vertexShader = /* glsl */ `
  attribute float elevation;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vElevation = elevation;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D colorRamp;
  uniform sampler2D overlayMap;
  uniform bool hasOverlay;
  uniform float overlayOpacity;
  uniform float seaLevel;
  uniform float contourCount;
  uniform vec3 lightDir;
  uniform vec3 highlightUv; // xy = uv center, z = radius (negative = disabled)

  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 base = texture2D(colorRamp, vec2(vElevation, 0.5)).rgb;

    vec3 normal = normalize(vNormal);
    float hillshade = clamp(dot(normal, normalize(lightDir)), 0.0, 1.0);
    hillshade = 0.55 + hillshade * 0.55; // keep tint legible, avoid pitch-black shadows
    base *= min(hillshade, 1.15);

    // Contour lines (skipped underwater, where they read as noise on flat sea)
    float landT = smoothstep(seaLevel, seaLevel + 0.01, vElevation);
    float bands = vElevation * contourCount;
    float dist = abs(fract(bands - 0.5) - 0.5) * 2.0;
    float aa = max(fwidth(bands) * 1.5, 0.0008);
    float line = 1.0 - smoothstep(0.0, aa, dist);
    float isMajor = step(4.5, mod(floor(bands), 5.0));
    vec3 contourColor = mix(vec3(0.22, 0.16, 0.09), vec3(0.08, 0.05, 0.02), isMajor);
    base = mix(base, contourColor, line * 0.32 * landT);

    // Shoreline foam-ish highlight right at sea level
    float shoreDist = abs(vElevation - seaLevel);
    float shoreLine = 1.0 - smoothstep(0.0, 0.004, shoreDist);
    base = mix(base, vec3(0.95, 0.94, 0.88), shoreLine * 0.5);

    vec3 finalColor = base;
    if (hasOverlay) {
      vec3 overlay = texture2D(overlayMap, vUv).rgb;
      finalColor = mix(base, overlay, overlayOpacity);
    }

    if (highlightUv.z > 0.0) {
      float d = distance(vUv, highlightUv.xy);
      float ring = smoothstep(highlightUv.z, highlightUv.z * 0.7, d) - smoothstep(highlightUv.z * 0.7, highlightUv.z * 0.4, d);
      finalColor = mix(finalColor, vec3(0.98, 0.85, 0.45), clamp(ring, 0.0, 1.0) * 0.55);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const TerrainMaterialImpl = shaderMaterial(
  {
    colorRamp: null as THREE.Texture | null,
    overlayMap: null as THREE.Texture | null,
    hasOverlay: false as boolean,
    overlayOpacity: 0,
    seaLevel: 0.42,
    contourCount: 36,
    lightDir: new THREE.Vector3(-0.45, 0.82, 0.35).normalize(),
    highlightUv: new THREE.Vector3(0, 0, -1),
  },
  vertexShader,
  fragmentShader
);

export type TerrainMaterialInstance = InstanceType<typeof TerrainMaterialImpl>;
