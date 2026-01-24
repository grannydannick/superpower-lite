import { useEffect, useState } from 'react';

export const useCheckPerformance = () => {
  const [isPerformanceSufficient, setIsPerformanceSufficient] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = null;
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let testShader: WebGLShader | null = null;

    const checkPerformance = async () => {
      try {
        canvas = document.createElement('canvas');
        context = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!context) {
          setIsPerformanceSufficient(false);
          setIsLoading(false);
          return;
        }

        const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = context.getParameter(
            debugInfo.UNMASKED_RENDERER_WEBGL,
          );
          if (
            typeof renderer === 'string' &&
            renderer.toLowerCase().includes('software')
          ) {
            setIsPerformanceSufficient(false);
            setIsLoading(false);
            return;
          }
        }

        const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
        const maxViewportDims = context.getParameter(context.MAX_VIEWPORT_DIMS);

        if (
          maxTextureSize < 2048 ||
          maxViewportDims[0] < 1024 ||
          maxViewportDims[1] < 1024
        ) {
          setIsPerformanceSufficient(false);
          setIsLoading(false);
          return;
        }

        if (typeof window !== 'undefined') {
          const userAgent = window.navigator.userAgent;
          const isOldDevice =
            /Android [1-4](?:\.|$)|iPhone OS [1-9](?:[_.]|$)|iPad.*OS [1-9](?:[_.]|$)/.test(
              userAgent,
            );

          if (isOldDevice) {
            setIsPerformanceSufficient(false);
            setIsLoading(false);
            return;
          }
        }

        testShader = context.createShader(context.VERTEX_SHADER);
        if (testShader) {
          context.shaderSource(
            testShader,
            `
            attribute vec4 position;
            void main() {
              gl_Position = position;
            }
          `,
          );
          context.compileShader(testShader);

          if (!context.getShaderParameter(testShader, context.COMPILE_STATUS)) {
            setIsPerformanceSufficient(false);
            setIsLoading(false);
            return;
          }
        } else {
          setIsPerformanceSufficient(false);
          setIsLoading(false);
          return;
        }

        setIsPerformanceSufficient(true);
      } catch (error) {
        setIsPerformanceSufficient(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPerformance();

    return () => {
      if (testShader && context) {
        context.deleteShader(testShader);
      }
      if (context) {
        const extension = context.getExtension('WEBGL_lose_context');
        if (extension) {
          extension.loseContext();
        }
      }
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, []);

  return {
    isPerformanceSufficient,
    isLoading,
  };
};
