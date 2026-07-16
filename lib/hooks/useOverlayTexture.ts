"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

export function useOverlayTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      // Synchronizing with an external system (the loaded GPU texture) --
      // it must be cleared here so callers stop reading a stale texture.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTexture(null);
      return;
    }
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(url, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      // NoColorSpace (not SRGBColorSpace): this shader writes straight to
      // gl_FragColor with no colorspace_fragment re-encode step (that chunk
      // only gets auto-injected into three's built-in materials, not a raw
      // ShaderMaterial). Flagging the texture as sRGB makes the GPU
      // auto-linearize/darken it on sample with nothing to undo the darkening
      // before display -- keep it raw so sampled texels match the source PNG.
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
      setTexture(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
}
