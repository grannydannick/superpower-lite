import { Head } from '@/components/seo';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  children: JSX.Element;
  className?: string;
};

export const ConfiguratorLayout = (props: Props) => {
  return (
    <div
      className={cn(
        'mx-auto grid min-h-dvh w-full gap-16 py-8 md:p-8 lg:grid-cols-2 lg:justify-items-end',
        props.className,
      )}
    >
      <Head title={props.title} />
      {props.children}
    </div>
  );
};
