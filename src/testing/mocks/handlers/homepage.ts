import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

/**
 * Safety-net handlers for endpoints the homepage route's loader prefetches.
 * Tests that render the full route tree (e.g. via routeTree.gen) can end up
 * invoking the homepage loader even when the test is targeting a different
 * route. Without these, MSW's `onUnhandledRequest: 'error'` setup produces
 * unhandled rejections. Individual tests can still override with their own
 * handlers when needed.
 */
export const homepageHandlers = [
  http.get(`${env.API_URL}/biomarkers/healthscore/latest`, async () => {
    await networkDelay();
    return HttpResponse.json({ healthScore: null });
  }),
  http.get(`${env.API_URL}/biomarkers/bioage/latest`, async () => {
    await networkDelay();
    return HttpResponse.json({ bioAge: null });
  }),
  http.get(`${env.API_URL}/biomarkers/categories`, async () => {
    await networkDelay();
    return HttpResponse.json({ categories: [] });
  }),
  http.get(`${env.API_URL}/orders`, async () => {
    await networkDelay();
    return HttpResponse.json({ requestGroups: [] });
  }),
  http.get(`${env.API_URL}/credits`, async () => {
    await networkDelay();
    return HttpResponse.json({ credits: [] });
  }),
  http.get(`${env.API_URL}/gifts`, async () => {
    await networkDelay();
    return HttpResponse.json({ gifts: [] });
  }),
  http.get(`${env.API_URL}/redraws`, async () => {
    await networkDelay();
    return HttpResponse.json({ redraws: [] });
  }),
  http.get(`${env.API_URL}/wearables`, async () => {
    await networkDelay();
    return HttpResponse.json({ wearables: [] });
  }),
  http.get(`${env.API_URL}/family-risk/plan`, async () => {
    await networkDelay();
    return HttpResponse.json({ plan: { risks: [] } });
  }),
  http.post(`${env.API_URL}/chat/followup`, async () => {
    await networkDelay();
    return HttpResponse.json([]);
  }),
];
