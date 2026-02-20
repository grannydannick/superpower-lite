import type { RouteObject } from 'react-router';

/**
 * Protocol route configuration
 * All protocol-related routes are defined here
 */
export const protocolRoutes: RouteObject = {
  path: 'protocol',
  children: [
    // Latest protocol
    {
      index: true,
      lazy: async () => {
        const { ProtocolRoute } = await import('./protocol-home');
        return { Component: ProtocolRoute };
      },
    },
    // Specific protocol by ID
    {
      path: 'plans/:id',
      lazy: async () => {
        const { ProtocolByIdRoute } = await import('./protocol-by-id');
        return { Component: ProtocolByIdRoute };
      },
    },
    // Specific goal
    {
      path: 'plans/:planId/goals/:goalId',
      lazy: async () => {
        const { ProtocolGoalRoute } = await import('./protocol-goal');
        return { Component: ProtocolGoalRoute };
      },
    },
    // Reveal flow - single dynamic route
    {
      path: 'reveal/:step?',
      lazy: async () => {
        const { ProtocolRevealRoute } = await import('./protocol-reveal');
        return { Component: ProtocolRevealRoute };
      },
    },
    // Autopilot - standalone page (fake door experiment)
    {
      path: 'autopilot',
      lazy: async () => {
        const { ProtocolAutopilotRoute } = await import('./protocol-autopilot');
        return { Component: ProtocolAutopilotRoute };
      },
    },
  ],
};
