import { TZDateMini } from '@date-fns/tz';
import { format } from 'date-fns';
import React, { useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Body2, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { LegacyProtocol } from '../../../api';
import { isActivityInProtocol } from '../../../utils/legacy/protocol-activity';
import { ProtocolBook } from '../../protocol-book';
import { ProtocolItemRow } from '../../protocol-item-row';
import { ProtocolTextItemRow } from '../../protocol-text-item-row';

import { ProtocolTabEmpty } from './protocol-tab-empty';

type ProtocolTabValue =
  | 'products'
  | 'lifestyle'
  | 'nutrition'
  | 'general'
  | 'previous';

interface ProtocolTab {
  value: ProtocolTabValue;
  label: string;
}

const PROTOCOL_TABS = [
  { value: 'products' as const, label: 'Products' },
  { value: 'lifestyle' as const, label: 'Lifestyle' },
  { value: 'nutrition' as const, label: 'Nutrition' },
  { value: 'general' as const, label: 'General' },
  { value: 'previous' as const, label: 'Previous protocols' },
] satisfies ProtocolTab[];

const ProtocolTabContent = ({
  tabValue,
  protocol,
  historicalProtocols,
  isMobile,
}: {
  tabValue: ProtocolTabValue;
  protocol: LegacyProtocol;
  historicalProtocols: LegacyProtocol[] | undefined;
  isMobile: boolean;
}) => {
  switch (tabValue) {
    case 'products': {
      if (protocol.activities.length === 0) {
        return <ProtocolTabEmpty />;
      }

      let hasAdditionalProducts = false;
      let hasAvoidProducts = false;
      const additionalProductNodes: React.ReactElement[] = [];
      const avoidProductNodes: React.ReactElement[] = [];

      for (const [index, activity] of protocol.activities.entries()) {
        if (activity.type === 'avoid-product') {
          hasAvoidProducts = true;
          const key = `avoid-product:${index}`;

          avoidProductNodes.push(
            <ProtocolTextItemRow
              key={key}
              activity={activity}
              useDummyIcon={true}
            />,
          );
          continue;
        }

        if (isActivityInProtocol(activity, protocol) === false) {
          continue;
        }

        if (activity.type === 'product') {
          hasAdditionalProducts = true;
          const key = `product:${activity.product.url ?? activity.product.name}`;

          additionalProductNodes.push(
            <ProtocolItemRow
              key={key}
              activity={activity}
              showPurchase={true}
            />,
          );
          continue;
        }

        if (activity.type === 'service') {
          hasAdditionalProducts = true;
          const key = `service:${activity.service.id}`;

          additionalProductNodes.push(
            <ProtocolItemRow
              key={key}
              activity={activity}
              showPurchase={true}
            />,
          );
          continue;
        }

        if (activity.type === 'prescription') {
          hasAdditionalProducts = true;
          const key = `prescription:${activity.prescription.pdpUrl ?? activity.prescription.name}`;

          additionalProductNodes.push(
            <ProtocolItemRow
              key={key}
              activity={activity}
              showPurchase={true}
            />,
          );
        }
      }

      return (
        <div className="space-y-8 md:pb-24">
          {hasAdditionalProducts && (
            <div>
              <H4 className="mb-4">Your protocol items</H4>
              <div className="space-y-4">{additionalProductNodes}</div>
            </div>
          )}

          {hasAvoidProducts && (
            <div>
              <H4 className="mb-4">Avoid these for now:</H4>
              <div className="space-y-4">{avoidProductNodes}</div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Server renders in UTC, we should be consistent with this */}
            <Body2 className="m-0 leading-none text-zinc-400">
              {format(new TZDateMini(protocol.created, 'UTC'), 'MMM do, yyyy')}
            </Body2>
            <div className="-mt-px size-[3px] rounded-full bg-zinc-400" />
            <div className="flex items-center gap-1">
              <AIIcon className="-mt-0.5 size-4 shrink-0" />
              <Body2 className="text-zinc-400">
                Written by Superpower's proprietary AI
              </Body2>
            </div>
          </div>
        </div>
      );
    }
    case 'general':
    case 'lifestyle':
    case 'nutrition': {
      const currentTabNodes: React.ReactElement[] = [];

      for (const [index, activity] of protocol.activities.entries()) {
        if (activity.type !== tabValue) continue;

        const key = `${activity.type}:${index}`;
        currentTabNodes.push(
          <ProtocolTextItemRow key={key} activity={activity} />,
        );
      }

      return (
        <div className="space-y-8">
          <div className="space-y-4">{currentTabNodes}</div>

          <AiSuggestions
            context={`I'm currently looking at my Protocol, particulairly at ${tabValue} activities. Please give me some suggestions for questions I can ask regarding this.`}
          />
        </div>
      );
    }
    case 'previous': {
      if (historicalProtocols == null || historicalProtocols.length === 0) {
        return <ProtocolTabEmpty />;
      }

      const previousProtocolNodes: React.ReactElement[] = [];

      for (const historicalProtocol of historicalProtocols) {
        const supportingInfo = historicalProtocol.supportingInfo;

        let supportingText = '';
        for (const si of supportingInfo) {
          supportingText =
            supportingText === ''
              ? si.display
              : `${supportingText}, ${si.display}`;
        }

        previousProtocolNodes.push(
          <Link
            key={historicalProtocol.id}
            to="/protocol/legacy/$id"
            params={{ id: historicalProtocol.id }}
            className="group flex items-center gap-8 rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm lg:rounded-none lg:border-none lg:p-0 lg:shadow-none"
          >
            <div className="flex items-center gap-4">
              <ProtocolBook
                className="w-16 -rotate-6 rounded-xl shadow-2xl lg:w-40 lg:rotate-0 max-lg:[&_#cover]:rounded-sm max-lg:[&_#date]:hidden max-lg:[&_p]:text-[10px]"
                title="Protocol"
                date={
                  isMobile
                    ? undefined
                    : format(
                        new Date(historicalProtocol.created),
                        'dd MMM, yyyy',
                      )
                }
                // TODO: figure out image when there are > 1 supporting info elements
                coverImage={'/action-plan/aiap-book-cover.webp'}
              />
            </div>
            <div className="lg:hidden">
              <Body2>{historicalProtocol.title}</Body2>
              <Body2 className="text-secondary">
                {format(new Date(historicalProtocol.created), 'dd MMM yyyy')}
              </Body2>
              {supportingInfo.length > 0 && (
                <Body2 className="text-secondary">{supportingText}</Body2>
              )}
            </div>
          </Link>,
        );
      }

      return (
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-12">
          {previousProtocolNodes}
        </div>
      );
    }
    default:
      return <ProtocolTabEmpty />;
  }
};

export const ProtocolTabs = ({
  protocol,
  historicalProtocols,
}: {
  protocol: LegacyProtocol;
  historicalProtocols?: LegacyProtocol[];
}) => {
  const [activeTab, setActiveTab] = useState<ProtocolTabValue>('products');
  const isMobile = useIsMobile();

  let hasLifestyle = false;
  let hasNutrition = false;
  let hasGeneral = false;

  for (const activity of protocol.activities) {
    if (activity.type === 'lifestyle') hasLifestyle = true;
    if (activity.type === 'nutrition') hasNutrition = true;
    if (activity.type === 'general') hasGeneral = true;
  }

  const hasPrevious =
    historicalProtocols != null && historicalProtocols.length > 0;

  const tabsToShow: ProtocolTab[] = [];
  for (const tab of PROTOCOL_TABS) {
    if (tab.value === 'products') {
      tabsToShow.push(tab);
      continue;
    }
    if (tab.value === 'lifestyle' && hasLifestyle) {
      tabsToShow.push(tab);
      continue;
    }
    if (tab.value === 'nutrition' && hasNutrition) {
      tabsToShow.push(tab);
      continue;
    }
    if (tab.value === 'general' && hasGeneral) {
      tabsToShow.push(tab);
      continue;
    }
    if (tab.value === 'previous' && hasPrevious) {
      tabsToShow.push(tab);
      continue;
    }
  }

  const tabNodes: React.ReactElement[] = [];
  for (const tab of tabsToShow) {
    const isActive = activeTab === tab.value;

    tabNodes.push(
      <Button
        key={tab.value}
        type="button"
        size={isMobile ? 'small' : 'medium'}
        variant={isActive ? 'default' : 'outline'}
        className={cn(
          'shrink-0 whitespace-nowrap rounded-full border py-2 shadow-none transition-colors',
          isActive ? 'border-primary' : 'border-input text-primary',
        )}
        aria-pressed={isActive}
        onClick={() => {
          if (isActive) return;
          setActiveTab(tab.value);
        }}
      >
        {tab.label}
      </Button>,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-0">
        {tabNodes}
      </div>
      <ProtocolTabContent
        tabValue={activeTab}
        protocol={protocol}
        historicalProtocols={historicalProtocols}
        isMobile={isMobile}
      />
    </div>
  );
};
