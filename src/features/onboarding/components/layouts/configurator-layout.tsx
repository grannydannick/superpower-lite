import React from 'react';

import { Head } from '@/components/seo';

type Props = {
  title: string;
  children: JSX.Element;
};

export const ConfiguratorLayout = (props: Props) => {
  return (
    <div className="flex h-dvh flex-col bg-white lg:flex-row">
      <Head title={props.title} />
      {props.children}
    </div>
  );
};
