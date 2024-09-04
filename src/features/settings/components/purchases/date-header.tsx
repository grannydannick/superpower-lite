import React from 'react';

interface DateHeaderProps {
  occurrence: string;
}
export function DateHeader({ occurrence }: DateHeaderProps): JSX.Element {
  const month = occurrence.split(' ')[0];
  const year = occurrence.split(' ')[1];
  return (
    <div className="flex gap-1.5 py-2 md:p-6">
      <h1 className="text-2xl text-[#52525B]">{month}</h1>
      <h1 className="text-2xl text-[#D4D4D8]">{year}</h1>
    </div>
  );
}
