import {
  Config,
  removeBackground as imglyRemoveBackground,
} from '@imgly/background-removal';

type ImgSource = ImageData | ArrayBuffer | Uint8Array | Blob | URL | string;

// Uses WebGPU when available https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
const config: Config = {
  device: 'gpu',
};

export const removeBackground = async (img: ImgSource): Promise<Blob> => {
  const result = await imglyRemoveBackground(img, config);
  return result as Blob;
};
