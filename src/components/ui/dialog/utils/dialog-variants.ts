import { cva } from 'class-variance-authority';

export const dialogVariants = cva('max-w-xl rounded-3xl bg-white p-8', {
  variants: {
    size: {
      small: 'max-w-sm max-[408px]:max-w-[calc(100%-2rem)]',
      medium: 'max-w-md max-[472px]:max-w-[calc(100%-2rem)]',
      large: 'max-w-lg max-[536px]:max-w-[calc(100%-2rem)]',
      xlarge: 'max-w-xl max-[600px]:max-w-[calc(100%-2rem)]',
      '2xlarge': 'max-w-2xl max-[696px]:max-w-[calc(100%-2rem)]',
    },
  },
});
