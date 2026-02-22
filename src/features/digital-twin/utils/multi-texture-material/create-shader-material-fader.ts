import { ShaderMaterial, Texture } from 'three';

type MultiTextureFaderOptions = {
  duration?: number;
  easing?: string;
};

type MultiTextureFader = {
  setTexture: (texture: Texture | null) => void;
  dispose: () => void;
};

export function createShaderMaterialFader(
  material: ShaderMaterial,
  options: MultiTextureFaderOptions = {},
): MultiTextureFader {
  const { duration = 1, easing = 'power2.out' } = options;

  const baseTexture = material.uniforms.baseMap.value;
  let currentTexture: Texture | null = material.uniforms.baseMap.value ?? null;
  let isFading = false;
  const queue: (Texture | null)[] = [];
  let cancelFade: (() => void) | null = null;

  const ease = (t: number) => {
    if (easing === 'power2.out') {
      const inv = 1 - t;
      return 1 - inv * inv;
    }
    return t;
  };

  const setTexture = (texture: Texture | null) => {
    if (!baseTexture) texture = baseTexture;
    if (texture === currentTexture || queue.at(-1) === texture) return;
    queue.push(texture);
    if (!isFading) runNextFade();
  };

  const runNextFade = () => {
    const next = queue.shift();
    if (!next) return;

    isFading = true;

    material.uniforms.overlayFrom.value = currentTexture;
    material.uniforms.overlayTo.value = next;
    material.uniforms.alpha.value = 0;

    if (cancelFade) {
      cancelFade();
      cancelFade = null;
    }

    const durationMs = duration * 1000;
    const start = performance.now();
    let rafId: number | null = null;
    let cancelled = false;

    const complete = () => {
      currentTexture = next;
      material.uniforms.baseMap.value = next;
      material.uniforms.overlayFrom.value = null;
      material.uniforms.overlayTo.value = null;
      material.uniforms.alpha.value = 0;
      material.needsUpdate = true;

      isFading = false;
      if (queue.length > 0) runNextFade();
    };

    const tick = (now: number) => {
      if (cancelled) {
        return;
      }

      const elapsed = now - start;
      const t = durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
      material.uniforms.alpha.value = ease(t);
      material.needsUpdate = true;

      if (t >= 1) {
        cancelFade = null;
        rafId = null;
        complete();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    cancelFade = () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  };

  return {
    setTexture,
    dispose: () => {
      queue.length = 0;
      if (cancelFade) {
        cancelFade();
        cancelFade = null;
      }
    },
  };
}
