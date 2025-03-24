import { Meta, StoryObj } from '@storybook/react';

import { MultiSelect } from '@/components/ui/multi-select/multi-select';

const meta: Meta<typeof MultiSelect> = {};

export default meta;

type Story = StoryObj<typeof MultiSelect>;

const OPTIONS = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
];

const DemoMultiSelect = () => {
  return <MultiSelect onValueChange={() => {}} options={OPTIONS} />;
};

export const Default: Story = {
  render: () => <DemoMultiSelect />,
};
