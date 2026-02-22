import { extend } from '@react-three/fiber';
import {
  useRef,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  memo,
} from 'react';
import { Group, Material, Vector3, MeshBasicMaterial, BackSide } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

import nbInternationalProUrl from '@/assets/fonts/NBInternationalPro/nbinternationalpro.json?url';

extend({ TextGeometry });

import { COLORS } from '../const/constants';
import type { Area, Level } from '../types';
import {
  createTweenValue,
  createColorTween,
} from '../utils/create-tween-values';

let cachedFont: Font | null = null;
let cachedFontPromise: Promise<Font> | null = null;

const loadFont = () => {
  if (cachedFont) {
    return Promise.resolve(cachedFont);
  }

  if (cachedFontPromise) {
    return cachedFontPromise;
  }

  cachedFontPromise = fetch(nbInternationalProUrl)
    .then((res) => res.json())
    .then((data) => {
      const font = new FontLoader().parse(data);
      cachedFont = font;
      return font;
    })
    .catch((error: unknown) => {
      cachedFontPromise = null;
      throw error;
    });

  return cachedFontPromise;
};

const TextMesh = ({
  position,
  rotation = [0, 0, 0.3],
  size,
  material,
  font,
  layers,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: number;
  material: Material;
  font: Font;
  layers: number;
}) => (
  <mesh
    visible
    layers={layers}
    position={position}
    rotation={rotation}
    material={material}
  >
    <textGeometry args={['Z', { font, size, depth: 0.01 }]} />
  </mesh>
);

export const Sleep = memo(
  ({
    area,
    level = 'good',
    position,
    layers,
  }: {
    area?: Area;
    level?: Level;
    position: Vector3 | [number, number, number];
    layers: number;
  }) => {
    const [font, setFont] = useState<Font | null>(() => cachedFont);

    useEffect(() => {
      if (font) {
        return;
      }

      let cancelled = false;
      void loadFont()
        .then((loaded) => {
          if (cancelled) {
            return;
          }
          setFont(loaded);
        })
        .catch((error: unknown) => {
          console.error('Failed to load 3D font', error);
        });

      return () => {
        cancelled = true;
      };
    }, [font]);

    const sleepRef = useRef<Group>(null);
    const initialAreaRef = useRef(area);
    const initialLevelRef = useRef(level);

    const material = useMemo(
      () =>
        new MeshBasicMaterial({
          side: BackSide,
          transparent: true,
          opacity: initialAreaRef.current === 'sleep' ? 1 : 0,
          color:
            (initialLevelRef.current && COLORS[initialLevelRef.current]) ||
            '#ffffff',
          depthWrite: false,
        }),
      [],
    );

    const { setTarget } = useMemo(
      () =>
        createColorTween(material.color, (color) => {
          material.color.set(color);
        }),
      [material],
    );

    const sleepTween = useMemo(() => {
      let lastValue = 0;

      return createTweenValue(initialAreaRef.current === 'sleep' ? 1 : 0, {
        duration: 1,
        onStart: () => {
          sleepRef.current && (sleepRef.current.visible = true);
        },
        onUpdate: (value) => {
          lastValue = value;
          const scale = 0.98 + value * 0.02;
          sleepRef.current?.scale.set(scale, scale, scale);
          material.opacity = value;
        },
        onComplete: () => {
          if (lastValue === 0 && sleepRef.current) {
            sleepRef.current.visible = false;
          }
        },
      });
    }, [material]);

    useEffect(() => {
      setTarget((level && COLORS[level]) || '#ffffff');
      sleepTween.set(!!level && area === 'sleep' ? 1 : 0);
    }, [area, level, setTarget, sleepTween]);

    useLayoutEffect(() => {
      if (!font) {
        return;
      }

      const value = sleepTween.get();
      const scale = 0.98 + value * 0.02;
      sleepRef.current?.scale.set(scale, scale, scale);
      material.opacity = value;
      if (sleepRef.current) {
        sleepRef.current.visible = value !== 0;
      }
    }, [font, material, sleepTween]);

    const positions: [number, number, number][] = [
      [0.046, 0.691, 0.01],
      [0.065, 0.7125, 0],
      [0.082, 0.727, 0],
    ];

    const sizes = [0.023, 0.018, 0.015];

    if (!font) {
      return null;
    }

    return (
      <group ref={sleepRef} visible={area === 'sleep'} position={position}>
        {positions.map((pos, idx) => (
          <TextMesh
            key={`${pos[0]}-${pos[1]}-${pos[2]}`}
            position={pos}
            size={sizes[idx]}
            material={material}
            font={font}
            layers={layers}
          />
        ))}
      </group>
    );
  },
);

Sleep.displayName = 'Sleep';
