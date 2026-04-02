import { format } from 'date-fns';

import { Link } from '@/components/ui/link';
import { Body3, H4 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';

import { ProtocolBook } from '../protocol-book';

export interface PastProtocolItem {
  id: string;
  date: string;
  type: 'sp2' | 'legacy';
}

interface PastProtocolsProps {
  protocols: PastProtocolItem[];
}

export const PastProtocols = ({ protocols }: PastProtocolsProps) => {
  const { track } = useAnalytics();

  if (!protocols || protocols.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <H4>Past Protocols</H4>

      <div className="grid grid-cols-3 gap-4 lg:flex lg:flex-row lg:flex-wrap lg:gap-12">
        {protocols.map((protocol) => {
          const link =
            protocol.type === 'legacy'
              ? `/protocol/legacy/${protocol.id}`
              : `/protocol/plans/${protocol.id}`;

          return (
            <div key={`${protocol.type}-${protocol.id}`} className="space-y-2">
              <Link
                to={link}
                onClick={() =>
                  track('protocol_dashboard_past_protocol_clicked', {
                    protocol_id: protocol.id,
                    protocol_type: protocol.type,
                  })
                }
                className="group block"
              >
                <ProtocolBook
                  className="w-full rotate-0 rounded-xl shadow-2xl lg:w-20"
                  titleClassName="!text-[10px] lg:!text-xs"
                  title="Protocol"
                  coverImage={'/protocol/protocol-book-cover.webp'}
                />
              </Link>
              <Body3 className="text-secondary">
                {format(new Date(protocol.date), 'dd MMM, yyyy')}
              </Body3>
            </div>
          );
        })}
      </div>
    </div>
  );
};
