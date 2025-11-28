import { GitCompare, RefreshCcw, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { Body2, Body3, H4 } from '@/components/ui/typography';

const HIGHLIGHTS = [
  {
    icon: RefreshCcw,
    text: 'No more tracking labs, refills, doses, and changes so you can focus on the things that really matter.',
  },
  {
    icon: GitCompare,
    text: "You also pay monthly, lowering the cost of diagnostics you'd normally repeat every 6 months. Nothing wasted, nothing extra. Only what your body truly needs.",
  },
  {
    icon: TestTube,
    text: 'Let us run your protocol for you, or continue below to pick your stack.',
  },
];

export const AutopilotCard = () => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start gap-2">
        <AIIcon className="size-6 shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <H4>Superpower Autopilot</H4>
            <Body2>Prefer we run your entire protocol for you?</Body2>
          </div>
          <ul className="space-y-2">
            {HIGHLIGHTS.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <highlight.icon className="size-4 shrink-0 text-vermillion-900" />
                <Body2>{highlight.text}</Body2>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <Body3 className="text-secondary">
              Pay monthly for your diagnostics not upfront
            </Body3>
            <div className="size-1 rounded-full bg-zinc-200" />
            <Body3 className="text-secondary">Save an additional 10%</Body3>
            <div className="size-1 rounded-full bg-zinc-200" />
            <Body3 className="text-secondary">Cancel Anytime</Body3>
          </div>
          <Button variant="outline" size="small" asChild>
            <Link to="/protocol/autopilot">Learn more</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
