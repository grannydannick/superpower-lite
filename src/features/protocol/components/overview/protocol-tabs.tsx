import moment from 'moment';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Body2, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { Protocol } from '../../api';
import { isActivityInProtocol } from '../../utils/protocol-activity';
import { ProtocolBook } from '../protocol-book';
import { ProtocolItemRow } from '../protocol-item-row';
import { ProtocolTextItemRow } from '../protocol-text-item-row';

import { ProtocolTabEmpty } from './protocol-tab-empty';

type ProtocolTabValue =
  | 'products'
  | 'lifestyle'
  | 'nutrition'
  | 'general'
  | 'previous';

const PROTOCOL_TABS = [
  { value: 'products' as const, label: 'Products' },
  { value: 'lifestyle' as const, label: 'Lifestyle' },
  { value: 'nutrition' as const, label: 'Nutrition' },
  { value: 'general' as const, label: 'General' },
  { value: 'previous' as const, label: 'Previous protocols' },
];

export const ProtocolTabs = ({
  protocol,
  historicalProtocols,
}: {
  protocol: Protocol;
  historicalProtocols?: Protocol[];
}) => {
  const [activeTab, setActiveTab] = useState<ProtocolTabValue>('products');
  const isMobile = useIsMobile();

  const tabsToShow = PROTOCOL_TABS.filter((tab) => {
    switch (tab.value) {
      // Products will always be shown
      case 'products':
        return true;
      case 'lifestyle':
        return protocol.activities.some(
          (activity) => activity.type === 'lifestyle',
        );
      case 'nutrition':
        return protocol.activities.some(
          (activity) => activity.type === 'nutrition',
        );
      case 'general':
        console.log(
          protocol.activities.filter((activity) => activity.type === 'general'),
        );
        return protocol.activities.some(
          (activity) => activity.type === 'general',
        );
      case 'previous':
        return (
          historicalProtocols !== undefined && historicalProtocols.length > 0
        );
      default:
        return false;
    }
  });

  const renderTabContent = (tabValue: ProtocolTabValue) => {
    const currentTabActivities = protocol.activities.filter(
      (activity) => activity.type === tabValue,
    );
    switch (tabValue) {
      case 'products': {
        if (protocol.activities.length === 0) {
          return <ProtocolTabEmpty />;
        }

        // Todo: Filter out current items (ordered items?)
        // const currentItems = protocol.activities.filter((activity) =>
        //   isActivityInProtocol(activity, protocol),
        // );
        // Descoping for now
        // const currentItems: Activity[] = [];

        // Todo: Filter out items that are in the AIAP but NOT ordered yet
        const additionalProducts = protocol.activities.filter(
          (activity) =>
            isActivityInProtocol(activity, protocol) &&
            (activity.type === 'product' ||
              activity.type === 'service' ||
              activity.type === 'prescription'),
        );

        const avoidProducts = protocol.activities.filter(
          (activity) => activity.type === 'avoid-product',
        );

        return (
          <div className="space-y-8 md:pb-24">
            {/* {currentItems.length > 0 && (
              <div>
                <H4 className="mb-4">Your protocol items</H4>
                <div>
                  {currentItems.map((activity, index) => (
                    <ProtocolItemRow
                      key={index}
                      activity={activity}
                      showPurchase={false}
                    />
                  ))}
                </div>
              </div>
            )} */}

            {additionalProducts.length > 0 && (
              <div>
                <H4 className="mb-4">Your protocol items</H4>
                <div className="space-y-4">
                  {additionalProducts.map((activity, index) => (
                    <ProtocolItemRow
                      key={index}
                      activity={activity}
                      showPurchase={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {avoidProducts.length > 0 && (
              <div>
                <H4 className="mb-4">Avoid these for now:</H4>
                <div className="space-y-4">
                  {avoidProducts.map((activity, index) => (
                    <ProtocolTextItemRow
                      key={index}
                      activity={activity}
                      useDummyIcon={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'general':
      case 'lifestyle':
      case 'nutrition':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              {currentTabActivities.map((activity, index) => (
                <ProtocolTextItemRow key={index} activity={activity} />
              ))}
            </div>

            <AiSuggestions
              context={`I'm currently looking at my Protocol, particulairly at ${tabValue} activities. Please give me some suggestions for questions I can ask regarding this.`}
            />
          </div>
        );
      case 'previous':
        return historicalProtocols && historicalProtocols.length > 0 ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-12">
            {historicalProtocols.map((historicalProtocol) => (
              <Link
                key={historicalProtocol.id}
                to={`/protocol/plans/${historicalProtocol.id}`}
                className="group flex items-center gap-8 rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm lg:rounded-none lg:border-none lg:p-0 lg:shadow-none"
              >
                <div>
                  <ProtocolBook
                    className="w-16 -rotate-6 rounded-xl shadow-2xl lg:w-40 lg:rotate-0 max-lg:[&_#cover]:rounded-sm max-lg:[&_#date]:hidden max-lg:[&_p]:text-[10px]"
                    title={historicalProtocol.title}
                    date={
                      isMobile
                        ? undefined
                        : moment(historicalProtocol.created).format(
                            'DD MMM, YYYY',
                          )
                    }
                  />
                </div>
                <div className="lg:hidden">
                  <Body2>{historicalProtocol.title}</Body2>
                  <Body2 className="text-secondary">
                    {moment(historicalProtocol.created).format('DD MMM YYYY')}
                  </Body2>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <ProtocolTabEmpty />
        );
      default:
        return <ProtocolTabEmpty />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-0">
        {tabsToShow.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Button
              key={tab.value}
              type="button"
              size={isMobile ? 'small' : 'medium'}
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'shrink-0 py-2 whitespace-nowrap rounded-full border shadow-none transition-colors',
                isActive ? 'border-primary' : 'border-input text-primary',
              )}
              aria-pressed={isActive}
              onClick={() => {
                if (!isActive) setActiveTab(tab.value);
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
      {renderTabContent(activeTab)}
    </div>
  );
};
