import {
  UseMutationOptions,
  DefaultOptions,
  QueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';

import { Sentry } from '@/lib/sentry';

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  const message =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : 'Unknown error';
  return Object.assign(new Error(message), { cause: error });
}

export const queryConfig = {
  queries: {
    // throwOnError: true,
    // if this is true, then even if you invalidate query it won't refetch it if staleTime is still active
    // https://stackoverflow.com/questions/76670546/invalidate-all-queries-but-refetch-only-active
    //refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  },
} satisfies DefaultOptions;

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache: new QueryCache({
    onError: (error, query) => {
      Sentry.captureException(normalizeError(error), {
        contexts: { query: { queryKey: query.queryKey } },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      Sentry.captureException(normalizeError(error), {
        contexts: { mutation: { mutationKey: mutation.options.mutationKey } },
      });
    },
  }),
});

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
