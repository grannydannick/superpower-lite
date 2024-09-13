import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { App } from './app';
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

/**
 * Since before we loaded service worker into the app, it might give some weird behavior for users
 * with the new vite app, therefore if we can find it, we unregister it
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        registrations.forEach((registration) => {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.log('Service worker unregistered:', registration);
            } else {
              console.warn('Failed to unregister:', registration);
            }
          });
        });
      } else {
        console.log('No service worker to unregister.');
      }
    });
  });
}

enableMocking().then(() => {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
