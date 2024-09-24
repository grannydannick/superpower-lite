import { Meta, StoryObj } from '@storybook/react';
import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { MultiStepLoader } from './multi-step-loader';

const meta: Meta<typeof MultiStepLoader> = {
  component: MultiStepLoader,
};

export default meta;

type Story = StoryObj<typeof MultiStepLoader>;

const loadingStates = [
  {
    text: 'Getting Superpower',
  },
  {
    text: 'Chat with Kevin',
  },
  {
    text: 'Fly to SF',
  },
  {
    text: 'Become the best engineer',
  },
  {
    text: 'Master animations',
  },
];

const DemoMultiStepLoader = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      {/* Core loader Modal */}
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={2000}
      />

      {/* The buttons are for demo only, remove it in your actual code ⬇️ */}
      <Button
        onClick={() => setLoading(true)}
        style={{
          boxShadow:
            '0px -1px 0px 0px #ffffff40 inset, 0px 1px 0px 0px #ffffff40 inset',
        }}
      >
        Click to load
      </Button>

      {loading && (
        <button
          className="fixed right-4 top-4 z-[120] text-black dark:text-white"
          onClick={() => setLoading(false)}
        >
          <X className="size-10" />
        </button>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <DemoMultiStepLoader />,
};
