import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { FileIngestionDataPart } from '../../../../utils/data-parts';
import { FileIngestionBlock } from '../file-ingestion-block';

function makePart(
  overrides: Partial<FileIngestionDataPart['data']>,
): FileIngestionDataPart {
  return {
    type: 'data-file-ingestion',
    data: {
      fileId: 'f1',
      filename: 'cbc-march-2026.pdf',
      state: 'processing',
      status: 'processing',
      phase: null,
      classification: null,
      writtenCount: null,
      message: null,
      error: null,
      ...overrides,
    },
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderBlock(parts: FileIngestionDataPart[]) {
  return render(
    <Wrapper>
      <FileIngestionBlock parts={parts} />
    </Wrapper>,
  );
}

describe('FileIngestionBlock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders processing state with default label for single file', () => {
    renderBlock([
      makePart({ state: 'processing', status: 'processing', phase: null }),
    ]);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders phase-specific label when phase is available', () => {
    renderBlock([
      makePart({
        state: 'processing',
        status: 'processing',
        phase: 'extracting',
      }),
    ]);
    expect(screen.getByText('Extracting...')).toBeInTheDocument();
  });

  it('renders classifying phase label', () => {
    renderBlock([
      makePart({
        state: 'processing',
        status: 'processing',
        phase: 'classifying',
      }),
    ]);
    expect(screen.getByText('Classifying...')).toBeInTheDocument();
  });

  it('renders multi-file processing label when no phase', () => {
    renderBlock([
      makePart({
        fileId: 'f1',
        state: 'processing',
        status: 'processing',
        phase: null,
      }),
      makePart({
        fileId: 'f2',
        state: 'processing',
        status: 'processing',
        phase: null,
      }),
    ]);
    expect(screen.getByText('Processing 2 documents...')).toBeInTheDocument();
  });

  it('ignores unexpected runtime phase values', () => {
    const part = makePart({
      state: 'processing',
      status: 'processing',
      phase: 'extracting',
    });

    Object.defineProperty(part.data, 'phase', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    renderBlock([part]);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.queryByText('undefined…')).not.toBeInTheDocument();
  });

  it('renders registered state as processing', () => {
    renderBlock([makePart({ state: 'processing', status: 'registered' })]);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows completion label after transitioning from processing, then auto-hides', () => {
    const { rerender } = render(
      <Wrapper>
        <FileIngestionBlock
          parts={[makePart({ state: 'processing', status: 'processing' })]}
        />
      </Wrapper>,
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();

    // Transition to complete
    act(() => {
      rerender(
        <Wrapper>
          <FileIngestionBlock
            parts={[
              makePart({
                state: 'complete',
                status: 'final',
                writtenCount: 12,
              }),
            ]}
          />
        </Wrapper>,
      );
    });

    expect(screen.getByText('Extracted 12 lab results')).toBeInTheDocument();

    // After 5 seconds it should auto-hide
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      screen.queryByText('Extracted 12 lab results'),
    ).not.toBeInTheDocument();
  });

  it('shows "Processing complete" when transitioning with writtenCount 0', () => {
    const { rerender } = render(
      <Wrapper>
        <FileIngestionBlock
          parts={[makePart({ state: 'processing', status: 'processing' })]}
        />
      </Wrapper>,
    );

    act(() => {
      rerender(
        <Wrapper>
          <FileIngestionBlock
            parts={[
              makePart({
                state: 'complete',
                status: 'final',
                writtenCount: 0,
              }),
            ]}
          />
        </Wrapper>,
      );
    });

    expect(screen.getByText('Processing complete')).toBeInTheDocument();
  });

  it('does not render for already-complete data on mount (history)', () => {
    const { container } = renderBlock([
      makePart({
        state: 'complete',
        status: 'final',
        classification: 'lab_results_pathology',
        writtenCount: 5,
      }),
    ]);
    // Block should be hidden for historical data
    expect(container.firstChild).toBeNull();
  });

  it('renders failed state with error details', () => {
    renderBlock([
      makePart({
        state: 'complete',
        status: 'failed',
        error: 'No processing run was created for this file',
      }),
    ]);
    expect(screen.getByText('cbc-march-2026.pdf')).toBeInTheDocument();
    expect(
      screen.getByText('No processing run was created for this file'),
    ).toBeInTheDocument();
  });

  it('ignores unexpected runtime error values', () => {
    const part = makePart({
      state: 'complete',
      status: 'failed',
      error: 'Parse error: invalid format',
    });

    Object.defineProperty(part.data, 'error', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => renderBlock([part])).not.toThrow();
    expect(screen.getByText('cbc-march-2026.pdf')).toBeInTheDocument();
    expect(
      screen.queryByText('Parse error: invalid format'),
    ).not.toBeInTheDocument();
  });

  it('deduplicates parts by fileId keeping latest', () => {
    renderBlock([
      makePart({
        fileId: 'f1',
        state: 'processing',
        status: 'registered',
        phase: null,
      }),
      makePart({
        fileId: 'f1',
        state: 'processing',
        status: 'processing',
        phase: 'extracting',
      }),
    ]);
    // Should show phase label from the latest part, not "Processing 2 documents..."
    expect(screen.getByText('Extracting...')).toBeInTheDocument();
  });

  it('aggregates writtenCount across multiple completed files after transition', () => {
    const { rerender } = render(
      <Wrapper>
        <FileIngestionBlock
          parts={[
            makePart({
              fileId: 'f1',
              state: 'processing',
              status: 'processing',
            }),
            makePart({
              fileId: 'f2',
              state: 'processing',
              status: 'processing',
            }),
          ]}
        />
      </Wrapper>,
    );

    act(() => {
      rerender(
        <Wrapper>
          <FileIngestionBlock
            parts={[
              makePart({
                fileId: 'f1',
                state: 'complete',
                status: 'final',
                writtenCount: 5,
              }),
              makePart({
                fileId: 'f2',
                state: 'complete',
                status: 'final',
                writtenCount: 3,
              }),
            ]}
          />
        </Wrapper>,
      );
    });

    expect(screen.getByText('Extracted 8 lab results')).toBeInTheDocument();
  });

  it('shows singular "lab result" for writtenCount of 1 after transition', () => {
    const { rerender } = render(
      <Wrapper>
        <FileIngestionBlock
          parts={[makePart({ state: 'processing', status: 'processing' })]}
        />
      </Wrapper>,
    );

    act(() => {
      rerender(
        <Wrapper>
          <FileIngestionBlock
            parts={[
              makePart({
                state: 'complete',
                status: 'final',
                writtenCount: 1,
              }),
            ]}
          />
        </Wrapper>,
      );
    });

    expect(screen.getByText('Extracted 1 lab result')).toBeInTheDocument();
  });
});
