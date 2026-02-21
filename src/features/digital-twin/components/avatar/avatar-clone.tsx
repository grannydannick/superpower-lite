import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  MeshBasicMaterial,
  BackSide,
  Mesh,
  type Group,
  type Object3DEventMap,
} from 'three';

import { SCENES, COLORS } from '../../const/constants';
import type { Area, Level } from '../../types';
import {
  createTweenValue,
  createColorTween,
} from '../../utils/create-tween-values';

const MAX_GLOW = 0.9;

export const AvatarClone = ({
  area,
  level = 'good',
  object,
  layers,
}: {
  area?: Area;
  level?: Level;
  object: Group<Object3DEventMap>;
  layers: number;
}) => {
  const initialGlowRef = useRef<number>(
    !!level && !!area && (SCENES as any)?.[area]?.glow ? 1 : 0,
  );
  const initialColorRef = useRef<string>((level && COLORS[level]) || '#ffffff');

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        side: BackSide,
        transparent: true,
        opacity: MAX_GLOW * initialGlowRef.current,
        color: initialColorRef.current,
        depthWrite: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    object.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.layers.set(layers);
        mesh.material = material;
      }
    });
  }, [layers, material, object]);

  const { setTarget } = useMemo(
    () =>
      createColorTween(material.color, (color) => {
        material.color.set(color);
      }),
    [material],
  );

  const materialTween = useMemo(
    () =>
      createTweenValue(initialGlowRef.current, {
        duration: 1.5,
        onUpdate: (value) => {
          material.opacity = MAX_GLOW * value;
        },
      }),
    [material],
  );

  useLayoutEffect(() => {
    setTarget((level && COLORS[level]) || '#ffffff');
    materialTween.set(
      !!level && !!area && (SCENES as any)?.[area]?.glow ? 1 : 0,
    );
  }, [area, level, materialTween, setTarget]);

  return <primitive object={object} scale={[1, 1, 1]} />;
};
