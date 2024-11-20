import { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/components/ui/button';

import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  component: Spinner,
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const LG: Story = {
  render: () => (
    <Button>
      <Spinner size="lg" />
    </Button>
  ),
};

export const MD: Story = {
  render: () => (
    <Button>
      <Spinner size="md" />
    </Button>
  ),
};

export const SM: Story = {
  render: () => (
    <Button>
      <Spinner />
    </Button>
  ),
};

export const Primary: Story = {
  render: () => (
    <div className="size-40 bg-primary">
      <Button className="bg-white">
        <Spinner variant="primary" />
      </Button>
    </div>
  ),
};
