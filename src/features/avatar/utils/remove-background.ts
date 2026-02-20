import type { Config } from '@imgly/background-removal';

type ImgSource = ImageData | ArrayBuffer | Uint8Array | Blob | URL | string;

// Uses WebGPU when available https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
const config: Config = {
  device: 'gpu',
};

export const removeBackground = async (img: ImgSource): Promise<Blob> => {
  const { removeBackground: imglyRemoveBackground } =
    await import('@imgly/background-removal');
  const result = await imglyRemoveBackground(img, config);
  if (!(result instanceof Blob)) {
    throw new Error('Background removal returned a non-Blob result.');
  }
  return result;
};
