import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, AnimationMixer } from 'three';

import { useRenderSetup } from '../../hooks/use-render-setup';
import { useShaderMaterial } from '../../hooks/use-shader-material';
import type { DigitalTwinProps } from '../../types';
import {
  loadBaseTexture,
  loadRemainingTextures,
} from '../../utils/load-textures';

import { AvatarClone } from './avatar-clone';

export const Avatar = ({
  model,
  area,
  level,
  onLoadingStateChange,
}: DigitalTwinProps) => {
  const { gl } = useThree();
  const onLoadingStateChangeRef = useRef(onLoadingStateChange);

  useEffect(() => {
    onLoadingStateChangeRef.current = onLoadingStateChange;
  }, [onLoadingStateChange]);

  // load the glb model
  // Files in Vite's public folder are served from the root
  const modelUrl = `/models/${model}/${model}OptimisedV8.glb`;
  const { scene: modelScene, animations } = useGLTF(modelUrl);

  useEffect(() => {
    // Preload the GLB for snappier swaps between models
    try {
      useGLTF.preload(modelUrl);
    } catch (_) {
      // noop if preload is not supported in this context
    }
  }, [modelUrl]);

  const [textures, setTextures] = useState<any>(null);

  // progressive texture loading: base first for fast paint, rest in batches
  useEffect(() => {
    let cancelled = false;

    setTextures(null);

    // load base texture first
    loadBaseTexture({
      model,
      gl,
      onLoadingStateChange: (state) => {
        onLoadingStateChangeRef.current?.(state);
      },
    }).then((base) => {
      if (cancelled) return;
      setTextures(base);

      // then background-load the rest in small batches
      loadRemainingTextures({
        model,
        alreadyLoaded: 1,
        onLoadingStateChange: (state) => {
          onLoadingStateChangeRef.current?.(state);
        },
      }).then((rest) => {
        if (cancelled) return;
        setTextures((prev: any) => ({ ...(prev || {}), ...rest }));
      });
    });

    return () => {
      cancelled = true;
    };
  }, [gl, model]);

  // initiating the multi-texture shader material
  const shaderMaterial = useShaderMaterial({ textures, area, level });

  // main model
  const avatar = useMemo(() => {
    const cloned = modelScene.clone(true);
    shaderMaterial &&
      cloned.traverse((child) => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh;
          mesh.layers.set(2);
          mesh.material = shaderMaterial;
        }
      });

    return cloned;
  }, [modelScene, shaderMaterial]);

  // clone to generate the glow
  const avatarClone = useMemo(() => modelScene.clone(), [modelScene]);

  // setting up idle animation mixer for the model and the glow clone
  const mixer = useMemo(() => new AnimationMixer(modelScene), [modelScene]);
  useEffect(() => {
    if (avatar && avatarClone && animations.length) {
      mixer.clipAction(animations[0], avatar).play();
      mixer.clipAction(animations[0], avatarClone).play();
    }
  }, [avatar, avatarClone, animations, mixer]);

  // setting up and starting the renderer
  useRenderSetup({ area, mixer });

  return (
    <>
      <AvatarClone area={area} level={level} layers={1} object={avatarClone} />
      {shaderMaterial && <primitive object={avatar} scale={[1, 1, 1]} />}
    </>
  );
};
