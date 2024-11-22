// Utility function to set a cookie
export const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Utility function to get a cookie
export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// Function to get or rotate the banner variant
export const getBannerVariant = () => {
  const variant = getCookie('bannerVariant');
  const dismissDate = getCookie('dismissDate');

  // If dismissed and a week has passed, rotate the banner
  if (
    dismissDate &&
    new Date().getTime() >
      new Date(dismissDate).getTime() + 7 * 24 * 60 * 60 * 1000
  ) {
    const newVariant = getNextBannerVariant();
    // Set for another week
    setCookie('bannerVariant', newVariant, 7);
    // Clear dismissal date
    setCookie('dismissDate', '', -1);
    return newVariant;
  }

  if (!variant) {
    // if banner not set, always choose the simple one first.
    setCookie('bannerVariant', 'A', 7);
    return 'A';
  }

  return variant;
};

const getNextBannerVariant = () => {
  const variants = ['A', 'B', 'C'];
  return variants[Math.floor(Math.random() * variants.length)];
};
