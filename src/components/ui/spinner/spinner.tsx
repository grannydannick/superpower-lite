import { ring2 } from 'ldrs';

/**
 * If we don't have that, components that are using Spinner fail due to: Invalid string length
 * For now we will disable register for testing and will investigate later.
 */
if (!import.meta.env.TEST) {
  ring2.register();
}

const sizes = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 64,
  xl: 96,
};

const variants = {
  light: 'white',
  primary: '#18181B',
};

export type SpinnerProps = {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
};

export const Spinner = ({ size = 'sm', variant = 'light' }: SpinnerProps) => {
  return (
    <>
      <l-ring-2
        size={sizes[size]}
        stroke="3"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="0.8"
        color={variants[variant]}
      ></l-ring-2>

      <span className="sr-only">Loading</span>
    </>
  );
};
