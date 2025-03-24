const STORAGE_KEY = 'bypass';
const BYPASS_CODE = 'superpower-emr';

const setBypassInSession = (code: string) => {
  sessionStorage.setItem(STORAGE_KEY, code);
};

const cleanUrlParams = () => {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete(STORAGE_KEY);
  window.history.replaceState({}, document.title, newUrl.toString());
};

const checkUrlBypass = (bypassCode: string): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlBypass = urlParams.get(STORAGE_KEY);

  if (urlBypass === bypassCode) {
    setBypassInSession(bypassCode);
    cleanUrlParams();
    return true;
  }

  return false;
};

const checkSessionBypass = (bypassCode: string): boolean => {
  return sessionStorage.getItem(STORAGE_KEY) === bypassCode;
};

export const shouldBypassMaintenance = (): boolean => {
  return checkSessionBypass(BYPASS_CODE) || checkUrlBypass(BYPASS_CODE);
};
