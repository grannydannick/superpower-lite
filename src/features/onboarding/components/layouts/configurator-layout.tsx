import React from 'react';

import { Head } from '@/components/seo';

type Props = {
  title: string;
  children: JSX.Element;
};

export const ConfiguratorLayout = (props: Props) => {
  return (
    <div className="mx-auto grid min-h-dvh w-full gap-16 py-8 md:p-8 lg:grid-cols-2 lg:justify-items-end">
      <Head title={props.title} />
      {props.children}
    </div>
  );
};
