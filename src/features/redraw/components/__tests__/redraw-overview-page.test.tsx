import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderApp, userEvent } from '@/testing/test-utils';

import { RedrawOverviewPage } from '../redraw-overview-page';

describe('RedrawOverviewPage', () => {
  it('renders the recollection page copy and skip confirmation flow', async () => {
    const onConfirmSkip = vi.fn().mockResolvedValue(undefined);
    const onContinue = vi.fn();

    await renderApp(
      <RedrawOverviewPage
        redraw={{
          serviceRequestId: 'sr-redraw-1',
          missingBiomarkers: ['Apolipoprotein B', 'Estradiol'],
        }}
        onConfirmSkip={onConfirmSkip}
        onContinue={onContinue}
      />,
      { user: null },
    );

    const heading = screen.getByRole('heading', {
      name: /free redraw available/i,
    });
    const missingBiomarkersRow = screen.getByTestId('missing-biomarkers-row');
    const mainBiomarkerCard = screen.getByTestId('main-biomarker-card');
    const mainCopyStack = screen.getByTestId('main-copy-stack');

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'md:text-3xl');
    expect(screen.queryByText('Marketplace')).not.toBeInTheDocument();
    expect(screen.queryByText('Recollection')).not.toBeInTheDocument();
    expect(screen.getByTestId('blood-drop-icon')).toHaveClass('h-9', 'w-9');
    expect(screen.getByTestId('blood-drop-shape')).toHaveAttribute(
      'd',
      'M18 11.8C18.8 11.8 20.9 14.4 21.6 15.8C22.3 17.3 22.8 18.9 22.8 20.3C22.8 23.3 20.7 25.2 18 25.2C15.3 25.2 13.2 23.3 13.2 20.3C13.2 18.9 13.7 17.3 14.4 15.8C15.1 14.4 17.2 11.8 18 11.8Z',
    );
    expect(missingBiomarkersRow).toHaveClass('items-center');
    expect(screen.getByText('Apolipoprotein B')).toBeInTheDocument();
    expect(screen.getByText('Estradiol')).toBeInTheDocument();
    expect(
      within(mainBiomarkerCard).getByText('Apolipoprotein B'),
    ).toBeInTheDocument();
    expect(
      within(mainBiomarkerCard).getByText('Estradiol'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /our partner lab couldn't process these tests from your recent panel/i,
      ),
    ).toHaveClass('text-secondary');
    expect(mainBiomarkerCard).not.toHaveTextContent(
      /our partner lab couldn't process these tests from your recent panel/i,
    );
    expect(
      screen.getByText(
        /you're eligible for a free redraw, which requires a new appointment/i,
      ),
    ).toHaveClass('text-secondary');
    expect(
      screen.getByText(
        /if you'd prefer to skip this redraw, we'll release your available results and personalized protocol to your dashboard/i,
      ),
    ).toHaveClass('text-secondary');
    expect(
      screen.getByText(
        /note: once skipped, the free redraw for this panel is no longer available/i,
      ),
    ).toHaveClass('pt-[18px]', 'text-xs', 'text-zinc-400');
    expect(mainCopyStack).toHaveClass('space-y-4');

    await userEvent.click(screen.getByRole('button', { name: /skip redraw/i }));

    expect(
      screen.getByRole('heading', {
        name: /^skip free redraw\?$/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('skip-dialog-details')).toHaveClass(
      'items-center',
    );
    expect(
      screen.getByTestId('skip-dialog-biomarker-card'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('skip-dialog-checkbox-row')).toHaveClass(
      'items-center',
    );
    const skipDialogBiomarkerCard = screen.getByTestId(
      'skip-dialog-biomarker-card',
    );
    expect(screen.getAllByText('Apolipoprotein B').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Estradiol').length).toBeGreaterThan(1);
    expect(
      within(skipDialogBiomarkerCard).getByText('Apolipoprotein B'),
    ).toBeInTheDocument();
    expect(
      within(skipDialogBiomarkerCard).getByText('Estradiol'),
    ).toBeInTheDocument();
    expect(skipDialogBiomarkerCard).not.toHaveTextContent(
      "These tests from your recent panel couldn't be processed:",
    );
    expect(skipDialogBiomarkerCard).not.toHaveTextContent(
      /if you skip, the free redraw for these tests expires/i,
    );
    expect(
      screen.getByText(
        /these tests from your recent panel couldn't be processed:/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /if you skip, the free redraw for these tests expires and your remaining results will be released to your dashboard within the next few hours/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we'll let you know when they're ready/i),
    ).toHaveClass('block', 'pt-4');
    expect(
      screen.getByText(
        /i understand i'm skipping the free redraw for these tests/i,
      ),
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /^confirm$/i });

    expect(confirmButton).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox'));

    expect(confirmButton).toBeEnabled();

    await userEvent.click(confirmButton);

    await waitFor(() => expect(onConfirmSkip).toHaveBeenCalledTimes(1));

    await userEvent.click(
      screen.getByRole('button', { name: /continue to book/i }),
    );

    expect(
      screen.getAllByRole('heading', {
        name: /prepare for your recollection/i,
      }).length,
    ).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows N/A when missing biomarkers cannot be detected', async () => {
    await renderApp(
      <RedrawOverviewPage
        redraw={{
          serviceRequestId: 'sr-redraw-1',
          missingBiomarkers: [],
        }}
      />,
      { user: null },
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
