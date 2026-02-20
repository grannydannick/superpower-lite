import { useMemo, useState } from 'react';

import { useAuthorization } from '@/lib/authorization';

type CurrentOrderCreditDebugProps = {
  debugInfo: unknown;
  title?: string;
};

export const FloatingLogDebug = ({
  debugInfo,
  title = 'DEBUG: Current Credit',
}: CurrentOrderCreditDebugProps) => {
  const { checkAdminActorAccess } = useAuthorization();
  const [open, setOpen] = useState<boolean>(true);
  const pretty = useMemo(() => JSON.stringify(debugInfo, null, 2), [debugInfo]);
  const isAdmin = checkAdminActorAccess();

  const copy = () => navigator.clipboard?.writeText(pretty).catch(() => {});

  if (!import.meta.env.DEV && !isAdmin) return null;

  return (
    <div className="pointer-events-auto absolute bottom-5 left-5 z-50 w-[min(36rem,90vw)] text-xs">
      <div className="rounded-md bg-primary/90 text-white shadow-xl backdrop-blur">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 rounded-t-md border-b border-white/10 px-3 py-2">
          <span className="font-semibold">{title}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={copy}
              className="rounded px-2 py-1 transition hover:bg-white/20"
              title="Copy JSON (Alt+C)"
            >
              Copy
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded px-2 py-1 transition hover:bg-white/20"
              title="Collapse/Expand (Alt+D)"
            >
              {open ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Body */}
        {open && (
          <div className="max-h-[50vh] overflow-auto p-3">
            <pre className="whitespace-pre-wrap break-all leading-5">
              {pretty}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
