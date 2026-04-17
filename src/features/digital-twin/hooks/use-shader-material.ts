import { useEffect, useMemo } from 'react';

import type { Area, Level } from '../types/model';
import { createShaderMaterial } from '../utils/multi-texture-material/create-shader-material';
import { createShaderMaterialFader } from '../utils/multi-texture-material/create-shader-material-fader';

export const useShaderMaterial = ({
  textures,
  level,
  area,
  overlayStrength = 1.0,
}: {
  textures: any;
  area?: Area;
  level?: Level;
  overlayStrength?: number;
}) => {
  const baseTexture = textures?.base;
  const shaderMaterial = useMemo(() => {
    if (!baseTexture) return null;
    return createShaderMaterial(baseTexture);
  }, [baseTexture]);

  const materialFader = useMemo(() => {
    if (!shaderMaterial) return null;

    return createShaderMaterialFader(shaderMaterial, {
      duration: 0.8,
    });
  }, [shaderMaterial]);

  // responding to area and level prop changes (without reloading model or mixer)
  useEffect(() => {
    if (!materialFader) return;
    if (!textures) return;

    if (level != null && area != null && textures?.[area]?.[level]) {
      materialFader.setTexture(textures[area][level]);
      return;
    }

    if (textures.base) {
      materialFader.setTexture(textures.base);
    }
  }, [area, level, textures, materialFader]);

  useEffect(() => {
    if (!shaderMaterial) return;
    shaderMaterial.uniforms.overlayStrength.value = overlayStrength;
  }, [shaderMaterial, overlayStrength]);

  return shaderMaterial;
};
