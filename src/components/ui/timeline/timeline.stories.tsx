import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Button } from '@/components/ui/button';

import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineDot,
  TimelineCard,
  TimelineSpacer,
  TimelineEmptyCard,
  TimelineLabel,
} from './timeline';

const meta: Meta<typeof Timeline> = {
  component: Timeline,
};

export default meta;

type Story = StoryObj<typeof Timeline>;

export function TimelineDemo() {
  return (
    <Timeline>
      <TimelineLabel className="mb-2.5">Individual label example</TimelineLabel>
      <TimelineItem>
        <TimelineConnector />
        <TimelineHeader>
          <TimelineDot />
          <TimelineCard
            image="/services/superpower_blood_panel.png"
            button={
              <Button variant="outline" className="bg-white">
                Do something
              </Button>
            }
            title="Default example"
            description="Description example"
          />
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineLabel>Label inside timelineItem example</TimelineLabel>
        <TimelineConnector />
        <TimelineHeader>
          <TimelineDot status="disabled" />

          <TimelineCard
            image="/services/superpower_blood_panel.png"
            variant="disabled"
            title="Disabled example"
          />
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector />
        <TimelineHeader>
          <TimelineDot status="current" />
          <TimelineCard
            image="/services/superpower_blood_panel.png"
            title="Current example"
            button={
              <Button variant="outline" className="bg-white">
                Do something
              </Button>
            }
          />
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector />
        <TimelineHeader>
          <TimelineDot status="done" />
          <TimelineCard
            image="/services/superpower_blood_panel.png"
            title="Done example"
          />
        </TimelineHeader>
      </TimelineItem>
      <TimelineSpacer />
      <TimelineItem>
        <TimelineHeader>
          <TimelineDot />
          <TimelineEmptyCard />
        </TimelineHeader>
      </TimelineItem>
    </Timeline>
  );
}

export const Default: Story = {
  render: () => <Timeline />,
};
