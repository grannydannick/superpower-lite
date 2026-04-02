import { useWearablesOverview } from '../api/get-wearables-overview';

/**
 * Single source of truth for wearables data availability.
 *
 * - Polls every 15 s while data is missing, stops once data arrives.
 * - `hasData`  — true when the overview contains at least one metric.
 * - `showEmptyState` — true when loading is done and there's no data yet.
 * - `overview` — the raw overview payload (undefined until loaded).
 */
export function useWearablesData({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const query = useWearablesOverview({
    queryConfig: {
      enabled,
      refetchInterval: (q) => {
        const latest = q.state.data?.overview?.latest;
        if (!latest || Object.keys(latest).length === 0) return 15_000;
        return false;
      },
    },
  });

  const overview = query.data?.overview;
  const hasData =
    !query.isLoading &&
    !query.isError &&
    !!overview &&
    Object.keys(overview.latest).length > 0;

  const showEmptyState = enabled && !query.isLoading && !hasData;

  return {
    ...query,
    overview,
    hasData,
    showEmptyState,
  };
}
