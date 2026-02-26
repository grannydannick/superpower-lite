import { Meta } from '@storybook/react';
import React from 'react';

import { GaugeChart } from './gauge-chart';

export default {
  title: 'superpower/gauge-chart',
  component: GaugeChart,
} as Meta;

export const BasicGauge = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={75} />
    </div>
  );
};

export const LowScore = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={25} />
    </div>
  );
};

export const HighScore = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={95} />
    </div>
  );
};

export const WithCustomColors = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart
        value={60}
        gaugePrimaryColor="#00ff88"
        gaugeSecondaryColor="#333333"
        labelColor="#00ff88"
      />
    </div>
  );
};

export const WithRichColors = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={42} richColors={true} />
    </div>
  );
};

export const WithAnimation = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={78} animate={true} />
    </div>
  );
};

export const WithAnimationAndRichColors = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={85} animate={true} richColors={true} />
    </div>
  );
};

export const LightBackground = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <GaugeChart
        value={67}
        gaugePrimaryColor="#1f2937"
        gaugeSecondaryColor="#e5e7eb"
        labelColor="#1f2937"
      />
    </div>
  );
};

export const CustomSizedGauge = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900">
      <GaugeChart value={55} className="max-h-[400px] max-w-[400px]" />
    </div>
  );
};

export const MultipleGauges = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-gray-900">
      <div className="grid grid-cols-3 gap-8">
        <GaugeChart value={25} richColors={true} animate={true} />
        <GaugeChart value={60} richColors={true} animate={true} />
        <GaugeChart value={90} richColors={true} animate={true} />
      </div>
    </div>
  );
};
