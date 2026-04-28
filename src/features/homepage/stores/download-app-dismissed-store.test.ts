import { afterEach, describe, expect, it } from 'vitest';

import { useDownloadAppDismissedStore } from './download-app-dismissed-store';

afterEach(() => {
  useDownloadAppDismissedStore.setState({ dismissed: false });
  localStorage.clear();
});

describe('useDownloadAppDismissedStore', () => {
  it('starts with dismissed=false', () => {
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(false);
  });

  it('setDismissed(true) flips state', () => {
    useDownloadAppDismissedStore.getState().setDismissed(true);
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(true);
  });

  it('persists dismissed state under download-app-dismissed-v1 key', async () => {
    useDownloadAppDismissedStore.getState().setDismissed(true);
    await useDownloadAppDismissedStore.persist.rehydrate();
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(true);
  });
});
