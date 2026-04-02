import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMessageQueue } from './use-message-queue';

type Status = 'ready' | 'submitted' | 'streaming' | 'error';

describe('useMessageQueue', () => {
  it('dequeues and sends when status becomes ready', () => {
    const onSend = vi.fn();
    let status: Status = 'streaming';

    const { result, rerender } = renderHook(() =>
      useMessageQueue({ status, onSend }),
    );

    // Enqueue a message while streaming
    act(() => {
      result.current.enqueue({ text: 'hello', files: [] });
    });

    expect(result.current.queue).toHaveLength(1);
    expect(onSend).not.toHaveBeenCalled();

    // Status becomes ready → should dequeue and send
    status = 'ready';
    rerender();

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith({ text: 'hello', files: [] });
    expect(result.current.queue).toHaveLength(0);
  });

  it('does NOT re-fire when onSend identity changes', () => {
    let onSend = vi.fn();
    let status: Status = 'streaming';

    const { result, rerender } = renderHook(() =>
      useMessageQueue({ status, onSend }),
    );

    // Enqueue a message
    act(() => {
      result.current.enqueue({ text: 'queued msg', files: [] });
    });

    // Status becomes ready → sends the queued message
    status = 'ready';
    rerender();

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(result.current.queue).toHaveLength(0);

    // Simulate what happens in production: onSend gets a new identity
    // (e.g., because sendMessage from useChat changed reference)
    // This should NOT cause another send — the queue is empty.
    onSend = vi.fn();
    rerender();

    expect(onSend).not.toHaveBeenCalled();
    expect(result.current.queue).toHaveLength(0);
  });

  it('always calls the latest onSend even though ref is used', () => {
    let onSendV1 = vi.fn();
    let onSend = onSendV1;
    let status: Status = 'streaming';

    const { result, rerender } = renderHook(() =>
      useMessageQueue({ status, onSend }),
    );

    act(() => {
      result.current.enqueue({ text: 'hello', files: [] });
    });

    // Swap onSend to a new version BEFORE status becomes ready
    const onSendV2 = vi.fn();
    onSend = onSendV2;
    rerender();

    // Now go ready — should call v2, not v1
    status = 'ready';
    rerender();

    expect(onSendV1).not.toHaveBeenCalled();
    expect(onSendV2).toHaveBeenCalledTimes(1);
    expect(onSendV2).toHaveBeenCalledWith({ text: 'hello', files: [] });
  });

  it('does NOT double-send the same queued message on rapid rerenders', () => {
    const onSend = vi.fn();
    let status: Status = 'streaming';

    const { result, rerender } = renderHook(() =>
      useMessageQueue({ status, onSend }),
    );

    act(() => {
      result.current.enqueue({ text: 'only once', files: [] });
    });

    // Status becomes ready
    status = 'ready';

    // Simulate multiple rapid rerenders (as happens when onSend is unstable)
    rerender();
    rerender();
    rerender();

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith({ text: 'only once', files: [] });
  });

  it('sends queued messages in order', () => {
    const sendOrder: string[] = [];
    const onSend = vi.fn((msg: { text: string }) => {
      sendOrder.push(msg.text);
    });
    let status: Status = 'streaming';

    const { result, rerender } = renderHook(() =>
      useMessageQueue({ status, onSend }),
    );

    act(() => {
      result.current.enqueue({ text: 'first', files: [] });
      result.current.enqueue({ text: 'second', files: [] });
    });

    expect(result.current.queue).toHaveLength(2);

    // Status becomes ready → hook drains the queue via cascading setQueue calls
    status = 'ready';
    rerender();

    expect(sendOrder).toEqual(['first', 'second']);
    expect(result.current.queue).toHaveLength(0);
  });

  it('remove() deletes a message from the queue', () => {
    const onSend = vi.fn();

    const { result } = renderHook(() =>
      useMessageQueue({ status: 'streaming', onSend }),
    );

    act(() => {
      result.current.enqueue({ text: 'msg1', files: [] });
      result.current.enqueue({ text: 'msg2', files: [] });
    });

    const idToRemove = result.current.queue[0].id;

    act(() => {
      result.current.remove(idToRemove);
    });

    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].text).toBe('msg2');
  });
});
