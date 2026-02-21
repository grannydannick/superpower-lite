import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { SCENES as _scenes } from '../const/constants';
import type { Area } from '../types';
import { horizontalBlurShader, verticalBlurShader } from '../utils/blur-shader';
import { createTweenValue } from '../utils/create-tween-values';

export const useBlurShader = ({ area }: { area?: Area }) => {
  const blurShader = useMemo(() => {
    return {
      horizontal: new ShaderPass(horizontalBlurShader),
      vertical: new ShaderPass(verticalBlurShader),
    };
  }, []);

  const { size } = useThree();

  const scenes: any = _scenes;
  const sizeRef = useRef({ width: size.width, height: size.height });
  const initialBlurLevelRef = useRef<number>(
    (!!area && scenes?.[area]?.blurAmount) || 0.0022,
  );

  useEffect(() => {
    sizeRef.current.width = size.width;
    sizeRef.current.height = size.height;
  }, [size.width, size.height]);

  const blur = useMemo(
    () =>
      createTweenValue(initialBlurLevelRef.current, {
        duration: 1,
        onUpdate: (value) => {
          const { width, height } = sizeRef.current;
          const blurAmount = width * value;
          blurShader.horizontal.uniforms.blurAmount.value =
            blurAmount / (width / height);
          blurShader.vertical.uniforms.blurAmount.value = blurAmount;
        },
      }),
    [blurShader],
  );

  useEffect(() => {
    const blurAmount = !!area && scenes?.[area]?.blurAmount;
    blur.set(typeof blurAmount === 'number' ? blurAmount : 0.0022);
  }, [area, blur, scenes]);

  useEffect(() => {
    const value = blur.get();
    const blurAmount = size.width * value;
    blurShader.horizontal.uniforms.blurAmount.value =
      blurAmount / (size.width / size.height);
    blurShader.vertical.uniforms.blurAmount.value = blurAmount;
  }, [blur, blurShader, size.width, size.height]);

  return blurShader;
};
