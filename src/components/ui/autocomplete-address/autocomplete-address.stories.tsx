import { Meta, StoryObj } from '@storybook/react';

import { AutocompleteAddress } from './autocomplete-address';

const meta: Meta<typeof AutocompleteAddress> = {
  component: AutocompleteAddress,
};

export default meta;
type Story = StoryObj<typeof AutocompleteAddress>;

export const Default: Story = {
  args: {
    googleApiKey: 'AIzaSyB4uyJlUrJDEcJHmHDzeS0gHa4Wcg--keU',
  },
};
