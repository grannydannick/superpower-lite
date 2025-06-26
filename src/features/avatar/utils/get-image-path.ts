export const getImagePath = (path: string) => {
  if (path.startsWith('/Users')) {
    const localPath = '/local' + path.split('/uploads')[1];
    return localPath;
  }

  return path;
};
