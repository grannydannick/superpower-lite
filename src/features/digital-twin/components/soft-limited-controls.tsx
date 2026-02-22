import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { MathUtils } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const SoftLimitedOrbitControls = ({
  target,
}: {
  target: [number, number, number];
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);

  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const radiusRef = useRef<number | null>(null);

  const maxAzimuth = MathUtils.degToRad(15);
  const recenterSpeed = 0.05;

  useEffect(() => {
    const domElement = gl.domElement;
    const controls = new OrbitControls(camera, domElement);
    controlsRef.current = controls;

    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(target[0], target[1], target[2]);
    controls.update();

    const onStart = () => setIsUserInteracting(true);
    const onEnd = () => setIsUserInteracting(false);
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    radiusRef.current = controls.getDistance();
    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      controls.dispose();
      controlsRef.current = null;
      radiusRef.current = null;
    };
  }, [camera, gl, target]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (controls == null) return;

    let radius = radiusRef.current;
    if (radius === null) {
      radius = controls.getDistance();
      radiusRef.current = radius;
    }

    const polar = controls.getPolarAngle();
    const currentAzimuth = controls.getAzimuthalAngle();

    let targetAzimuth = currentAzimuth;

    if (isUserInteracting === false) {
      targetAzimuth = MathUtils.lerp(currentAzimuth, 0, recenterSpeed);
    } else {
      if (currentAzimuth > maxAzimuth) {
        targetAzimuth = MathUtils.lerp(currentAzimuth, maxAzimuth, 0.2);
      } else if (currentAzimuth < -maxAzimuth) {
        targetAzimuth = MathUtils.lerp(currentAzimuth, -maxAzimuth, 0.2);
      }
    }

    const x = radius * Math.sin(polar) * Math.sin(targetAzimuth);
    const y = radius * Math.cos(polar);
    const z = radius * Math.sin(polar) * Math.cos(targetAzimuth);

    controls.object.position.set(x, y, z);
    controls.object.lookAt(controls.target);
    controls.update();
  });

  return null;
};
