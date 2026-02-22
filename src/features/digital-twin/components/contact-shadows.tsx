import { useFrame, useThree } from '@react-three/fiber';
import * as React from 'react';
import {
  Color,
  Mesh,
  type Group,
  MeshDepthMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

// GroundShadow's caster mesh uses this layer so it never renders to screen.
export const CONTACT_SHADOWS_CASTER_LAYER = 3;

const SCALE = 1.5;
const OPACITY = 0.12;
const BLUR = 2;
const RESOLUTION = 128;
const FRAMES = 1;
const COLOR = new Color('#000000');

export const ContactShadows = () => {
  const groupRef = React.useRef<Group | null>(null);
  const shadowCameraRef = React.useRef<OrthographicCamera | null>(null);
  const renderedFramesRef = React.useRef(0);

  const { scene, gl } = useThree();

  const resources = React.useMemo(() => {
    const width = SCALE;
    const height = SCALE;

    const renderTarget = new WebGLRenderTarget(RESOLUTION, RESOLUTION);
    const renderTargetBlur = new WebGLRenderTarget(RESOLUTION, RESOLUTION);
    renderTarget.texture.generateMipmaps = false;
    renderTargetBlur.texture.generateMipmaps = false;

    const planeGeometry = new PlaneGeometry(width, height).rotateX(Math.PI / 2);
    const blurPlane = new Mesh(planeGeometry);
    blurPlane.visible = false;
    blurPlane.layers.set(CONTACT_SHADOWS_CASTER_LAYER);

    const depthMaterial = new MeshDepthMaterial();
    depthMaterial.depthTest = false;
    depthMaterial.depthWrite = false;
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ucolor: { value: COLOR },
      };

      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `uniform vec3 ucolor;
void main() {`,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4( vec3( 1.0 - fragCoordZ ), opacity );',
        'vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );',
      );
    };

    const horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader);
    const verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader);
    horizontalBlurMaterial.depthTest = false;
    verticalBlurMaterial.depthTest = false;

    return {
      width,
      height,
      renderTarget,
      renderTargetBlur,
      planeGeometry,
      depthMaterial,
      blurPlane,
      horizontalBlurMaterial,
      verticalBlurMaterial,
    };
  }, []);

  React.useEffect(() => {
    return () => {
      resources.verticalBlurMaterial.dispose();
      resources.horizontalBlurMaterial.dispose();
      resources.depthMaterial.dispose();
      resources.planeGeometry.dispose();
      resources.renderTarget.dispose();
      resources.renderTargetBlur.dispose();
    };
  }, [resources]);

  useFrame(() => {
    const group = groupRef.current;
    const shadowCamera = shadowCameraRef.current;
    if (group == null || shadowCamera == null) return;

    shadowCamera.layers.set(CONTACT_SHADOWS_CASTER_LAYER);

    if (FRAMES !== Infinity && renderedFramesRef.current >= FRAMES) {
      return;
    }

    renderedFramesRef.current += 1;

    const blurPlane = resources.blurPlane;
    const renderTarget = resources.renderTarget;
    const renderTargetBlur = resources.renderTargetBlur;
    const horizontalBlurMaterial = resources.horizontalBlurMaterial;
    const verticalBlurMaterial = resources.verticalBlurMaterial;
    const depthMaterial = resources.depthMaterial;

    const prevBackground = scene.background;
    const prevOverrideMaterial = scene.overrideMaterial;
    const prevRenderTarget = gl.getRenderTarget();

    const blurShadows = (blur: number) => {
      blurPlane.visible = true;

      blurPlane.material = horizontalBlurMaterial;
      horizontalBlurMaterial.uniforms.tDiffuse.value = renderTarget.texture;
      horizontalBlurMaterial.uniforms.h.value = (blur * 1) / 256;

      gl.setRenderTarget(renderTargetBlur);
      gl.render(blurPlane, shadowCamera);

      blurPlane.material = verticalBlurMaterial;
      verticalBlurMaterial.uniforms.tDiffuse.value = renderTargetBlur.texture;
      verticalBlurMaterial.uniforms.v.value = (blur * 1) / 256;

      gl.setRenderTarget(renderTarget);
      gl.render(blurPlane, shadowCamera);

      blurPlane.visible = false;
    };

    group.visible = false;

    scene.background = null;
    scene.overrideMaterial = depthMaterial;

    gl.setRenderTarget(renderTarget);
    gl.render(scene, shadowCamera);

    blurShadows(BLUR);
    blurShadows(BLUR * 0.4);

    gl.setRenderTarget(prevRenderTarget);

    scene.overrideMaterial = prevOverrideMaterial;
    scene.background = prevBackground;

    group.visible = true;
  });

  return (
    <group ref={groupRef} rotation-x={Math.PI / 2}>
      <mesh
        geometry={resources.planeGeometry}
        scale={[1, -1, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial
          transparent
          map={resources.renderTarget.texture}
          opacity={OPACITY}
          depthWrite={false}
        />
      </mesh>
      <orthographicCamera
        ref={shadowCameraRef}
        args={[
          -resources.width / 2,
          resources.width / 2,
          resources.height / 2,
          -resources.height / 2,
          0,
          10,
        ]}
      />
    </group>
  );
};
