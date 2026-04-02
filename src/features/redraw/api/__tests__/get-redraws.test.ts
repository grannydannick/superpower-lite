import { describe, expect, it, vi } from 'vitest';

const queryOptionsMock = vi.fn();

vi.mock('@/orpc/client', () => ({
  $api: {
    queryOptions: queryOptionsMock,
  },
}));

describe('getRedrawsQueryOptions', () => {
  it('delegates to the generated oRPC client', async () => {
    queryOptionsMock.mockReturnValue({ queryKey: ['redraws'] });

    const { getRedrawsQueryOptions } = await import('../get-redraws');

    expect(getRedrawsQueryOptions()).toEqual({ queryKey: ['redraws'] });
    expect(queryOptionsMock).toHaveBeenCalledWith('get', '/redraw');
  });
});
