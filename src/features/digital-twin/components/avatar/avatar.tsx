import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Mesh, AnimationMixer } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

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
  const { scene: modelScene, animations } = useLoader(
    GLTFLoader,
    modelUrl,
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    },
  );

  useEffect(() => {
    // Preload the GLB for snappier swaps between models
    try {
      useLoader.preload(GLTFLoader, modelUrl, (loader) => {
        loader.setMeshoptDecoder(MeshoptDecoder);
      });
    } catch (_) {
      // noop if preload is not supported in this context
    }
  }, [modelUrl]);

  const [texturesState, setTexturesState] = useState<{
    model: string;
    textures: any;
  } | null>(null);

  const textures =
    texturesState?.model === model ? texturesState.textures : null;

  // progressive texture loading: base first for fast paint, rest in batches
  useEffect(() => {
    let cancelled = false;

    // load base texture first
    loadBaseTexture({
      model,
      gl,
      onLoadingStateChange: (state) => {
        onLoadingStateChangeRef.current?.(state);
      },
    }).then((base) => {
      if (cancelled) return;
      setTexturesState({ model, textures: base });

      // then background-load the rest in small batches
      loadRemainingTextures({
        model,
        alreadyLoaded: 1,
        onLoadingStateChange: (state) => {
          onLoadingStateChangeRef.current?.(state);
        },
      }).then((rest) => {
        if (cancelled) return;
        setTexturesState((prev) => {
          const prevModel = prev?.model;
          const prevTextures = prev?.textures;

          if (prevModel !== model) {
            return { model, textures: { ...base, ...rest } };
          }

          return { model, textures: { ...(prevTextures ?? {}), ...rest } };
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [gl, model]);

  // initiating the multi-texture shader material
  const shaderMaterial = useShaderMaterial({ textures, area, level });

  // main model
  const avatar = useMemo(() => cloneSkeleton(modelScene), [modelScene]);

  useLayoutEffect(() => {
    if (!shaderMaterial) return;

    avatar.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.layers.set(2);
      child.material = shaderMaterial;
    });
  }, [avatar, shaderMaterial]);

  // clone to generate the glow
  const avatarClone = useMemo(() => cloneSkeleton(modelScene), [modelScene]);

  // setting up idle animation mixer for the model and the glow clone
  const mixer = useMemo(() => new AnimationMixer(avatar), [avatar]);
  useEffect(() => {
    if (!animations.length) return;

    const clip = animations[0];
    const avatarAction = mixer.clipAction(clip, avatar);
    const cloneAction = mixer.clipAction(clip, avatarClone);

    avatarAction.play();
    cloneAction.play();

    return () => {
      avatarAction.stop();
      cloneAction.stop();
      mixer.uncacheAction(clip, avatar);
      mixer.uncacheAction(clip, avatarClone);
    };
  }, [animations, avatar, avatarClone, mixer]);

  // setting up and starting the renderer
  useRenderSetup({ area, mixer });

  return (
    <>
      <AvatarClone area={area} level={level} layers={1} object={avatarClone} />
      {shaderMaterial && <primitive object={avatar} scale={[1, 1, 1]} />}
    </>
  );
};
