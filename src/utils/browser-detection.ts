export const isIOS = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export const isAndroid = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

export const isMobile = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|android|blackberry|windows phone|mobile|tablet/.test(
    userAgent,
  );
};
