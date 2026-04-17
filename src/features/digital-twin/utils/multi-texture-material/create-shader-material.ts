import { ShaderMaterial, Texture } from 'three';

export function createShaderMaterial(baseTexture: Texture): ShaderMaterial {
  const uniforms = {
    neutralMap: { value: baseTexture },
    baseMap: { value: baseTexture },
    overlayFrom: { value: baseTexture },
    overlayTo: { value: baseTexture },
    alpha: { value: 0.0 },
    overlayStrength: { value: 1.0 },
    brightness: { value: 1.15 },
    whiten: { value: 0.4 },
  };

  const shaderMaterial = new ShaderMaterial({
    uniforms,
    vertexShader: `
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    varying vec2 vUv;

    void main() {
      #include <uv_vertex>
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>

      vUv = uv;
    }
  `,
    fragmentShader: `
    #include <common>
    #include <uv_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>

    uniform sampler2D neutralMap;
    uniform sampler2D baseMap;
    uniform sampler2D overlayFrom;
    uniform sampler2D overlayTo;
    uniform float alpha;
    uniform float overlayStrength;
    uniform float brightness;
    uniform float whiten;

    varying vec2 vUv;

    void main() {
      #include <clipping_planes_fragment>

      vec4 neutralColor = texture2D(neutralMap, vUv);
      vec4 baseColor = texture2D(baseMap, vUv);
      vec4 fromColor = texture2D(overlayFrom, vUv);
      vec4 toColor = texture2D(overlayTo, vUv);

      // Crossfade from old overlay to new overlay
      vec4 overlay = mix(fromColor, toColor, alpha);

      // Blend overlay on top of base using overlay alpha
      vec4 finalColor = mix(baseColor, overlay, overlay.a);

      // Blend towards neutral base by overlayStrength
      finalColor = mix(neutralColor, finalColor, overlayStrength);

      // Apply brightness and subtle whitening towards white
      vec3 color = finalColor.rgb * brightness;
      color = mix(color, vec3(1.0), whiten);
      color = clamp(color, 0.0, 1.0);
      gl_FragColor = vec4(color, finalColor.a);

      #include <logdepthbuf_fragment>
    }
  `,

    transparent: true,
  });

  return shaderMaterial;
}
