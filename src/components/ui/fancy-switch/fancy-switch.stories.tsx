import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { FancySwitch } from './fancy-switch';

const meta: Meta<typeof FancySwitch> = {
  component: FancySwitch,
};

export default meta;

type Story = StoryObj<typeof FancySwitch>;

const DefaultSwitch = () => {
  const [selectedOption, setSelectedOption] = useState('apple');

  const options = ['apple', 'banana', 'cherry'];

  return (
    <FancySwitch
      value={selectedOption}
      options={options}
      onChange={setSelectedOption}
      data-testid="orderType"
      className="flex rounded-full bg-muted p-2"
      highlighterClassName="bg-primary rounded-full"
      aria-label="Order type"
      radioClassName={cn(
        'relative mx-2 flex h-9 cursor-pointer items-center justify-center',
        'rounded-full px-3.5 text-sm font-medium transition-colors data-[checked]:text-primary-foreground focus:outline-none',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      )}
      highlighterIncludeMargin={true}
    />
  );
};

export const Default: Story = {
  render: () => <DefaultSwitch />,
};
