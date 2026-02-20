import { cn } from '@/lib/utils';

export const RadioButton = ({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange?: () => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'mr-4 size-2.5 rounded-full outline outline-[1.5px] outline-offset-2 outline-black',
        className,
      )}
      onClick={onChange}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onChange?.();
        }
      }}
    >
      {checked && <div className="size-full rounded-full bg-black" />}
    </div>
  );
};
