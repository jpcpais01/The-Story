import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

const vertexShader = /* glsl */ `
  attribute float elevation;
  attribute float temperature;
  attribute float humidity;
  varying vec2 vUv;
  varying float vElevation;
  varying float vTemperature;
  varying float vHumidity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vElevation = elevation;
    vTemperature = temperature;
    vHumidity = humidity;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D overlayMap;
  uniform bool hasOverlay;
  uniform float overlayOpacity;
  uniform float seaLevel;
  uniform vec3 lightDir;
  uniform vec3 highlightUv; // xy = uv center, z = radius (negative = disabled)
  uniform float mapAspect; // widthUnits / depthUnits, for an even border erosion band
  uniform float borderErosion; // 0 = disabled, ~0.05-0.09 = a torn-parchment edge

  varying vec2 vUv;
  varying float vElevation;
  varying float vTemperature;
  varying float vHumidity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // Cheap hash-based value noise, used only for the border erosion mask below.
  float borderHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float borderValueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = borderHash(i);
    float b = borderHash(i + vec2(1.0, 0.0));
    float c = borderHash(i + vec2(0.0, 1.0));
    float d = borderHash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float borderNoiseFbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      sum += amp * borderValueNoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }

  // Alpha-only mask (no color change) that ragged-fades the mesh to nothing
  // near the frame border, like a worn parchment edge -- independent of
  // elevation/biome, purely a function of position within the frame.
  float borderMask() {
    if (borderErosion <= 0.0) return 1.0;
    float distFromEdgeX = min(vUv.x, 1.0 - vUv.x) * mapAspect;
    float distFromEdgeY = min(vUv.y, 1.0 - vUv.y);
    float distFromEdge = min(distFromEdgeX, distFromEdgeY);
    float n = borderNoiseFbm(vUv * 40.0);
    float raggedness = borderErosion * (0.4 + 0.9 * n);
    return smoothstep(raggedness - 0.015, raggedness + 0.015, distFromEdge);
  }

  vec3 waterColor(float elevation) {
    float t = clamp(elevation / max(seaLevel, 0.0001), 0.0, 1.0); // 0 deepest, 1 at shore
    vec3 deep = vec3(0.071, 0.192, 0.290);
    vec3 mid = vec3(0.122, 0.333, 0.471);
    vec3 shallow = vec3(0.310, 0.584, 0.659);
    vec3 c = mix(deep, mid, smoothstep(0.0, 0.55, t));
    c = mix(c, shallow, smoothstep(0.55, 0.92, t));
    return c;
  }

  vec3 landBiomeColor(float landElevation, float temp, float humidity) {
    vec3 desert     = vec3(0.851, 0.722, 0.447);
    vec3 savanna    = vec3(0.761, 0.635, 0.357);
    vec3 rainforest = vec3(0.184, 0.420, 0.229);
    vec3 grassland  = vec3(0.494, 0.639, 0.329);
    vec3 forest     = vec3(0.298, 0.478, 0.239);
    vec3 taiga      = vec3(0.247, 0.420, 0.353);
    vec3 tundra     = vec3(0.541, 0.604, 0.490);
    vec3 rock       = vec3(0.541, 0.502, 0.455);
    vec3 snow       = vec3(0.973, 0.965, 0.945);
    vec3 beach      = vec3(0.894, 0.851, 0.675);

    vec3 hot = mix(desert, savanna, smoothstep(0.0, 0.35, humidity));
    hot = mix(hot, rainforest, smoothstep(0.35, 0.75, humidity));

    vec3 temperate = mix(grassland, forest, smoothstep(0.2, 0.75, humidity));

    vec3 cold = mix(tundra, taiga, smoothstep(0.15, 0.7, humidity));

    vec3 c = mix(cold, temperate, smoothstep(0.32, 0.55, temp));
    c = mix(c, hot, smoothstep(0.6, 0.78, temp));

    // Bare rock and snowcaps override the biome tint at high elevation / extreme cold.
    c = mix(c, rock, smoothstep(0.42, 0.68, landElevation));
    float snowFactor = clamp(smoothstep(0.72, 0.92, landElevation) + smoothstep(0.22, 0.0, temp), 0.0, 1.0);
    c = mix(c, snow, snowFactor);

    // Beach right at the shoreline.
    float beachFactor = 1.0 - smoothstep(0.0, 0.035, landElevation);
    c = mix(c, beach, beachFactor);

    return c;
  }

  void main() {
    vec3 base;
    if (vElevation < seaLevel) {
      base = waterColor(vElevation);
    } else {
      float landElevation = (vElevation - seaLevel) / max(1.0 - seaLevel, 0.0001);
      base = landBiomeColor(landElevation, vTemperature, vHumidity);
    }

    // The hand-drawn overlay (if any) replaces the *raw* biome color here,
    // before any relief shading -- so hillshading below applies to whichever
    // is showing, draping real 3D elevation cues over the artwork instead of
    // the overlay flattening/erasing them.
    if (hasOverlay) {
      vec3 overlay = texture2D(overlayMap, vUv).rgb;
      base = mix(base, overlay, overlayOpacity);
    }

    vec3 normal = normalize(vNormal);
    float hillshade = clamp(dot(normal, normalize(lightDir)), 0.0, 1.0);
    hillshade = 0.55 + hillshade * 0.55; // keep tint legible, avoid pitch-black shadows
    base *= min(hillshade, 1.15);

    // Shoreline foam-ish highlight right at sea level
    float shoreDist = abs(vElevation - seaLevel);
    float shoreLine = 1.0 - smoothstep(0.0, 0.004, shoreDist);
    base = mix(base, vec3(0.95, 0.94, 0.88), shoreLine * 0.5);

    vec3 finalColor = base;

    if (highlightUv.z > 0.0) {
      float d = distance(vUv, highlightUv.xy);
      float ring = smoothstep(highlightUv.z, highlightUv.z * 0.7, d) - smoothstep(highlightUv.z * 0.7, highlightUv.z * 0.4, d);
      finalColor = mix(finalColor, vec3(0.98, 0.85, 0.45), clamp(ring, 0.0, 1.0) * 0.55);
    }

    gl_FragColor = vec4(finalColor, borderMask());
  }
`;

export const TerrainMaterialImpl = shaderMaterial(
  {
    overlayMap: null as THREE.Texture | null,
    hasOverlay: false as boolean,
    overlayOpacity: 0,
    seaLevel: 0.42,
    lightDir: new THREE.Vector3(-0.45, 0.82, 0.35).normalize(),
    highlightUv: new THREE.Vector3(0, 0, -1),
    mapAspect: 2,
    borderErosion: 0.07,
  },
  vertexShader,
  fragmentShader
);

export type TerrainMaterialInstance = InstanceType<typeof TerrainMaterialImpl>;
