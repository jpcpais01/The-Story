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
      tex.colorSpace = THREE.SRGBColorSpace;
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
