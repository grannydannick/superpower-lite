// Default content which will be used to back port old action plans.
export const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          class: 'text-base text-zinc-300',
          text: 'Type here and make sure to include why the goal matters for this individual.',
        },
      ],
    },
  ],
};
