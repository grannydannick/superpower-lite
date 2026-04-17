import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';

import type { Area, Level, Model } from '../types';

import { Avatar } from './avatar/avatar';
import { GroundShadow } from './ground-shadow';
import { Sleep } from './sleep';
import { SoftLimitedOrbitControls } from './soft-limited-controls';
import { Toxins } from './toxins';

export default function DigitalTwinModel({
  model,
  area,
  level,
  overlayStrength,
  onLoadingStateChange,
}: {
  model: Model;
  area?: Area;
  level?: Level;
  overlayStrength?: number;
  onLoadingStateChange?: (loaded: number) => void;
}) {
  const cameraProps = useMemo(
    () => ({ position: [0, 0.5, 9.4] as [number, number, number], fov: 6.0 }),
    [],
  );

  const controlsTarget = useMemo(
    () => [0, 0.35, 0] as [number, number, number],
    [],
  );

  const sleepPos = useMemo(
    () => [0, model === 'male' ? 0 : -0.016, 0] as [number, number, number],
    [model],
  );
  const toxinsPos = useMemo(
    () => [0, model === 'male' ? 0.008 : 0, 0] as [number, number, number],
    [model],
  );

  return (
    <Canvas
      className="size-full"
      linear
      flat
      camera={cameraProps}
      dpr={[1, 1.25]}
      gl={{ powerPreference: 'high-performance' }}
    >
      <SoftLimitedOrbitControls target={controlsTarget} />

      {area === 'sleep' && (
        <Sleep area={area} level={level} layers={1} position={sleepPos} />
      )}

      {area === 'toxic' && (
        <Toxins area={area} level={level} layers={1} position={toxinsPos} />
      )}

      <Avatar
        model={model}
        area={area}
        level={level}
        overlayStrength={overlayStrength}
        onLoadingStateChange={onLoadingStateChange}
      />

      <GroundShadow />
    </Canvas>
  );
}
