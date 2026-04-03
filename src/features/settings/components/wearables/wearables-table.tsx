import { useQueryClient } from '@tanstack/react-query';
import { useVitalLink } from '@tryvital/vital-link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { env } from '@/config/env';
import { useConnectWearable } from '@/features/settings/api/get-vital-token';
import {
  getWearablesQueryOptions,
  useWearables,
} from '@/features/settings/api/get-wearables';
import { ConfirmDelete } from '@/features/settings/components/wearables/confirm-delete';
import { ConnectingOverlay } from '@/features/settings/components/wearables/connecting-overlay';
import { MobileAppBanner } from '@/features/settings/components/wearables/mobile-app-banner';
import { WearableConnectedModal } from '@/features/settings/components/wearables/wearable-connected-modal';
import {
  WEARABLE_PROVIDERS,
  WearableProviderDefinition,
} from '@/features/settings/const/wearable-providers';
import { useWearableReport } from '@/features/wearables/hooks/use-wearable-report';
import { cn } from '@/lib/utils';
import { Wearable } from '@/types/api';

export function WearablesTable() {
  const { data, isLoading } = useWearables();
  const queryClient = useQueryClient();
  const connectMutation = useConnectWearable();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null,
  );
  const [popupOpen, setPopupOpen] = useState(false);
  const [connectedProviderName, setConnectedProviderName] = useState<
    string | null
  >(null);
  const { generate: generateReport } = useWearableReport();
  const popupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current != null) clearInterval(popupTimerRef.current);
    };
  }, []);

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getWearablesQueryOptions().queryKey,
    });
  }, [queryClient]);

  const { open, ready } = useVitalLink({
    onSuccess,
    onExit: () => {},
    onError: () => {},
    env: env.VITAL_ENV || 'sandbox',
  });

  const handleConnect = async (provider: string) => {
    setConnectingProvider(provider);
    try {
      const result = await connectMutation.mutateAsync(provider);
      if (result.linkWebUrl) {
        // Open provider auth directly in a popup — skips the SDK provider picker
        const w = 500;
        const h = 700;
        const left = window.screenX + (window.innerWidth - w) / 2;
        const top = window.screenY + (window.innerHeight - h) / 2;
        const popup = window.open(
          result.linkWebUrl,
          'vital-link',
          `width=${w},height=${h},left=${left},top=${top}`,
        );
        // Poll for popup close to trigger refresh
        if (popup) {
          setPopupOpen(true);
          // Clear any existing interval before starting a new one
          if (popupTimerRef.current != null) {
            clearInterval(popupTimerRef.current);
          }
          popupTimerRef.current = window.setInterval(() => {
            if (popup.closed) {
              if (popupTimerRef.current != null)
                clearInterval(popupTimerRef.current);
              popupTimerRef.current = null;
              setPopupOpen(false);
              setConnectingProvider(null);

              const def = allProviders.find((p) => p.provider === provider);
              const name = def?.name ?? provider;

              // Refetch and verify the provider is actually connected
              queryClient
                .invalidateQueries({
                  queryKey: getWearablesQueryOptions().queryKey,
                })
                .then(() => {
                  const fresh = queryClient.getQueryData<{
                    wearables: Wearable[];
                  }>(getWearablesQueryOptions().queryKey);
                  const connected = fresh?.wearables?.some(
                    (w) => w.provider === provider && w.status === 'connected',
                  );
                  if (connected) {
                    setConnectedProviderName(name);
                    generateReport(name);
                  } else {
                    toast.error(`Connecting ${name} was aborted.`);
                  }
                });
            }
          }, 500);
        } else {
          setConnectingProvider(null);
        }
      } else if (result.linkToken) {
        // Fallback to SDK modal
        open(result.linkToken);
        setConnectingProvider(null);
      } else {
        setConnectingProvider(null);
      }
    } catch {
      setConnectingProvider(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  const wearablesByProvider = new Map<string, Wearable>();
  for (const w of data?.wearables ?? []) {
    wearablesByProvider.set(w.provider, w);
  }

  // Include connected providers not in the hardcoded list
  const knownProviders = new Set(WEARABLE_PROVIDERS.map((p) => p.provider));

  // Extra providers are for when we want to show a connected provider that isn't in the hardcoded list - user should still be able to disconnect.
  const extraProviders: WearableProviderDefinition[] = [];
  for (const [provider] of wearablesByProvider) {
    if (!knownProviders.has(provider)) {
      extraProviders.push({
        provider,
        name: provider
          .replace(/_/g, ' ')
          .replace(/\bv\d+$/i, '')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
  }
  const allProviders = [...WEARABLE_PROVIDERS, ...extraProviders];

  const left = allProviders.filter((_, i) => i % 2 === 0);
  const right = allProviders.filter((_, i) => i % 2 === 1);

  return (
    <div className="space-y-16 md:space-y-4">
      <MobileAppBanner />
      <div>
        <h3 className="pb-4 text-2xl font-medium md:hidden">
          Connect your wearables
        </h3>
        <Card>
          <div className="hidden px-10 pb-2 pt-8 md:block">
            <h3 className="text-xl font-medium">Connect your wearables</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div>
              {left.map((def, i) => (
                <ProviderCard
                  key={def.provider}
                  definition={def}
                  connectedWearable={wearablesByProvider.get(def.provider)}
                  onConnect={handleConnect}
                  isConnecting={connectingProvider === def.provider}
                  connectReady={ready}
                  isLastInColumn={i === left.length - 1}
                  isLastOverall={i === left.length - 1 && right.length === 0}
                />
              ))}
            </div>
            <div>
              {right.map((def, i) => (
                <ProviderCard
                  key={def.provider}
                  definition={def}
                  connectedWearable={wearablesByProvider.get(def.provider)}
                  onConnect={handleConnect}
                  isConnecting={connectingProvider === def.provider}
                  connectReady={ready}
                  isLastInColumn={i === right.length - 1}
                  isLastOverall={i === right.length - 1}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
      {popupOpen && connectingProvider && (
        <ConnectingOverlay
          providerName={
            allProviders.find((p) => p.provider === connectingProvider)?.name ??
            connectingProvider
          }
          onDismiss={() => setPopupOpen(false)}
        />
      )}
      <WearableConnectedModal
        providerName={connectedProviderName}
        open={connectedProviderName != null}
        onOpenChange={(open) => {
          if (!open) setConnectedProviderName(null);
        }}
        onGenerateReport={() => {}}
      />
    </div>
  );
}

function ProviderCard({
  definition,
  connectedWearable,
  onConnect,
  isConnecting,
  connectReady,
  isLastInColumn,
  isLastOverall,
}: {
  definition: WearableProviderDefinition;
  connectedWearable: Wearable | undefined;
  onConnect: (provider: string) => void;
  isConnecting: boolean;
  connectReady: boolean;
  isLastInColumn: boolean;
  isLastOverall: boolean;
}) {
  const isConnected = connectedWearable?.status === 'connected';
  const icon = definition.icon || connectedWearable?.logo || '';
  const isAppleHealthOnWeb =
    definition.provider === 'apple_health_kit' && !isConnected;

  return (
    <div className="flex items-center gap-4 pl-6 pr-6 md:pl-10 md:pr-10">
      {icon ? (
        <img
          src={icon}
          alt={definition.name}
          className="size-12 shrink-0 rounded-xl object-contain"
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg font-semibold text-zinc-400">
          {definition.name.charAt(0)}
        </div>
      )}
      <div
        className={cn(
          'flex flex-1 items-center gap-4 py-5',
          isLastOverall
            ? ''
            : isLastInColumn
              ? 'border-b border-zinc-200 md:border-b-0'
              : 'border-b border-zinc-200',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-zinc-900">
            {definition.name}
          </p>
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          ) : isAppleHealthOnWeb ? (
            <span className="text-sm text-zinc-400">
              Download the mobile app to connect
            </span>
          ) : (
            <span className="text-sm text-zinc-400">Not connected</span>
          )}
        </div>
        {isConnected ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="small"
                className="w-[108px] text-destructive"
              >
                Disconnect
              </Button>
            </DialogTrigger>
            <ConfirmDelete provider={connectedWearable!.provider} />
          </Dialog>
        ) : isAppleHealthOnWeb ? (
          <Button
            variant="outline"
            size="small"
            className="w-[132px]"
            onClick={() =>
              window.open(
                'https://apps.apple.com/us/app/superpower/id6747997159',
                '_blank',
              )
            }
          >
            Download app
          </Button>
        ) : (
          <Button
            variant="outline"
            size="small"
            className="w-[108px]"
            onClick={() => onConnect(definition.provider)}
            disabled={isConnecting || !connectReady}
          >
            {isConnecting ? 'Loading...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
}
