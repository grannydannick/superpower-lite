import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RedrawActionCard } from '../redraw-action-card';

describe('RedrawActionCard', () => {
  it('renders the recollection task with the same image treatment as other actionable rows', () => {
    const onClick = vi.fn();

    render(
      <RedrawActionCard
        redraw={{
          serviceRequestId: 'sr-redraw-1',
          serviceName: 'Superpower Blood Panel',
          serviceNames: ['Superpower Blood Panel'],
        }}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');
    const image = screen.getByRole('img', {
      name: 'Superpower Blood Panel',
    });

    expect(button).toHaveClass('rounded-[20px]', 'px-4', 'py-2');
    expect(image).toHaveClass('size-16', 'rounded-lg', 'object-cover');
    expect(screen.getByText('Recollection Available')).toBeInTheDocument();
    expect(
      screen.getByText('Recollect your missing tests'),
    ).toBeInTheDocument();
  });
});
