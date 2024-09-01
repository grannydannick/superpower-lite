import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './app';
import { enableMocking } from './testing/mocks';

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

/**
 * Sets up a listener for window storage events.
 * This synchronizes state across browser windows and browser tabs.
 */
window.addEventListener('storage', (e: StorageEvent) => {
  if (e.key === null || e.key === 'activeLogin') {
    // Storage events fire when different tabs make changes.
    // On storage clear (key === null) or activeLogin change (key === 'activeLogin')
    // Refresh the page to ensure the active login is up to date.
    window.location.reload();
  }
});

enableMocking().then(() => {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
