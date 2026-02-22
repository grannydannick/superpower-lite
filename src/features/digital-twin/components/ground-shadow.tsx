import {
  ContactShadows,
  CONTACT_SHADOWS_CASTER_LAYER,
} from './contact-shadows';

export const GroundShadow = () => (
  <group>
    <mesh
      position={[0, 1, 0]}
      layers={CONTACT_SHADOWS_CASTER_LAYER}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[0.1, 24]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>

    <ContactShadows />
  </group>
);
