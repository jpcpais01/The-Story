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
  uniform float contourCount;
  uniform vec3 lightDir;
  uniform vec3 highlightUv; // xy = uv center, z = radius (negative = disabled)

  varying vec2 vUv;
  varying float vElevation;
  varying float vTemperature;
  varying float vHumidity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

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
    float landT; // 0 underwater, 1 on land -- gates contour lines below
    if (vElevation < seaLevel) {
      base = waterColor(vElevation);
      landT = 0.0;
    } else {
      float landElevation = (vElevation - seaLevel) / max(1.0 - seaLevel, 0.0001);
      base = landBiomeColor(landElevation, vTemperature, vHumidity);
      landT = 1.0;
    }

    vec3 normal = normalize(vNormal);
    float hillshade = clamp(dot(normal, normalize(lightDir)), 0.0, 1.0);
    hillshade = 0.55 + hillshade * 0.55; // keep tint legible, avoid pitch-black shadows
    base *= min(hillshade, 1.15);

    // Contour lines (skipped underwater, where they read as noise on flat sea)
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
