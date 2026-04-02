import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { extractObservationId } from '@/features/messages/utils/parse-fhir-citation';
import { useAnalytics } from '@/hooks/use-analytics';
import { Biomarker, Category } from '@/types/api';

import type { Protocol, ProtocolGoal } from '../../api';
import {
  type ProtocolReveal,
  type RevealPhase,
  useCompleteReveal,
  useMarkPhaseComplete,
  useRevealLatest,
  useSaveShopifyOrder,
} from '../../api/reveal';
import { useInitializeRevealBuilder } from '../../stores/reveal-builder-store';

import { useProtocolStepper } from './protocol-stepper';

type ProtocolStepperContextType = ReturnType<typeof useProtocolStepper> & {
  // Loading state
  isLoading: boolean;

  // Existing - protocol data
  protocol: Protocol | null;
  goals: ProtocolGoal[];
  getGoal: (index: number) => ProtocolGoal | undefined;

  // Existing - categories/biomarkers data
  // Assumes latest results are being shown
  categories: Category[];
  biomarkers: Biomarker[];
  healthWinners: Category[];
  areasToImprove: Category[];
  getCategoryBiomarkers: (categoryName: string) => Biomarker[];
  getGoalBiomarkers: (goalIndex: number) => Biomarker[];
  totalCategoryCount: number;

  // Reveal state
  reveal: ProtocolReveal | null;
  lastCompletedPhase: RevealPhase | 'not_started';
  isRevealLoading: boolean;
  shouldShowReveal: boolean;
  markPhaseComplete: (phase: RevealPhase) => Promise<void>;
  saveShopifyOrder: (draftOrderId: string, invoiceUrl: string) => Promise<void>;
  completeReveal: () => Promise<void>;
  shopifyInvoiceUrl: string | null;
};

export const ProtocolStepperContext =
  createContext<ProtocolStepperContextType | null>(null);

type ProtocolStepperProviderProps = {
  children: React.ReactNode;
  currentStep?: string;
  protocol?: Protocol | null;
  categories?: Category[];
  biomarkers?: Biomarker[];
  isLoading?: boolean;
};

export const ProtocolStepperProvider = ({
  children,
  currentStep,
  protocol = null,
  categories = [],
  biomarkers = [],
  isLoading = false,
}: ProtocolStepperProviderProps) => {
  const goals = useMemo(() => protocol?.goals ?? [], [protocol]);

  // Reveal state from API
  const { data: revealData, isLoading: isRevealLoading } = useRevealLatest();
  const markPhaseMutation = useMarkPhaseComplete();
  const saveShopifyMutation = useSaveShopifyOrder();
  const completeMutation = useCompleteReveal();

  // Store mutation functions and protocolId in refs so callbacks have stable
  // identities. React Query recreates mutation objects every render, which
  // would otherwise break the useMemo chain on the context value.
  const protocolIdRef = useRef(revealData?.protocolId);
  const markPhaseMutateRef = useRef(markPhaseMutation.mutateAsync);
  const saveShopifyMutateRef = useRef(saveShopifyMutation.mutateAsync);
  const completeMutateRef = useRef(completeMutation.mutateAsync);

  const { track } = useAnalytics();
  const trackRef = useRef(track);

  useEffect(() => {
    protocolIdRef.current = revealData?.protocolId;
    markPhaseMutateRef.current = markPhaseMutation.mutateAsync;
    saveShopifyMutateRef.current = saveShopifyMutation.mutateAsync;
    completeMutateRef.current = completeMutation.mutateAsync;
    trackRef.current = track;
  });

  const markPhaseComplete = useCallback(async (phase: RevealPhase) => {
    const protocolId = protocolIdRef.current;
    if (!protocolId) return;
    await markPhaseMutateRef.current({ protocolId, phase });
  }, []);

  const saveShopifyOrder = useCallback(
    async (draftOrderId: string, invoiceUrl: string) => {
      const protocolId = protocolIdRef.current;
      if (!protocolId) return;
      await saveShopifyMutateRef.current({
        protocolId,
        draftOrderId,
        invoiceUrl,
      });
    },
    [],
  );

  const completeReveal = useCallback(async () => {
    const protocolId = protocolIdRef.current;
    if (!protocolId) return;
    await completeMutateRef.current(protocolId);
    trackRef.current('protocol_reveal_completed', { protocolId });
  }, []);

  // Initialize the reveal builder store for this protocol
  // This ensures committed actions are scoped to the current protocol version
  useInitializeRevealBuilder(protocol?.id, protocol?.updatedAt);

  // Compute healthWinners and areasToImprove first so we can pass to stepper
  const healthWinners = useMemo(
    () => categories.filter((c) => c.value === 'A'),
    [categories],
  );

  const areasToImprove = useMemo(
    () => categories.filter((c) => c.value === 'C'),
    [categories],
  );

  const hasAcceptedSupplements = useMemo(() => {
    if (!protocol) return false;
    return protocol.goals.some((goal) => {
      if (
        goal.primaryAction.content.type === 'supplement' &&
        goal.primaryAction.accepted === true
      ) {
        return true;
      }
      return (goal.additionalActions ?? []).some(
        (action) =>
          action.content.type === 'supplement' && action.accepted === true,
      );
    });
  }, [protocol]);

  // Pass onPhaseComplete to stepper so phase checkpoints fire automatically
  const stepper = useProtocolStepper({
    currentStepId: currentStep,
    goalCount: goals.length,
    onPhaseComplete: markPhaseComplete,
    hasHealthWinners: healthWinners.length > 0,
    hasAreasToImprove: areasToImprove.length > 0,
    hasAcceptedSupplements,
  });

  const getGoal = useCallback(
    (index: number): ProtocolGoal | undefined => {
      return goals[index];
    },
    [goals],
  );

  const getCategoryBiomarkers = useCallback(
    (categoryName: string): Biomarker[] => {
      return biomarkers.filter((b) => b.category === categoryName);
    },
    [biomarkers],
  );

  // Build an index mapping observation IDs to their parent biomarkers
  const observationBiomarkerIndex = useMemo(() => {
    const index = new Map<string, Biomarker>();
    for (const biomarker of biomarkers) {
      for (const result of biomarker.value ?? []) {
        if (result.id) {
          index.set(result.id.toString(), biomarker);
        }
      }
    }
    return index;
  }, [biomarkers]);

  const getGoalBiomarkers = useCallback(
    (goalIndex: number): Biomarker[] => {
      const goal = goals[goalIndex];
      if (!goal) return [];

      // goal.biomarkers is an array of FHIR references (e.g., "Observation/60c28bfc-...")
      // We need to resolve them to full Biomarker objects via their observation IDs
      const resolvedBiomarkers: Biomarker[] = [];
      const seenBiomarkerIds = new Set<string>();

      for (const reference of goal.biomarkers) {
        const biomarker = observationBiomarkerIndex.get(
          extractObservationId(reference),
        );

        // Deduplicate - multiple observations may belong to the same biomarker
        if (biomarker && !seenBiomarkerIds.has(biomarker.id)) {
          seenBiomarkerIds.add(biomarker.id);
          resolvedBiomarkers.push(biomarker);
        }
      }

      return resolvedBiomarkers;
    },
    [goals, observationBiomarkerIndex],
  );

  const totalCategoryCount = categories.length;

  const value = useMemo(
    () => ({
      ...stepper,
      isLoading,
      protocol,
      goals,
      getGoal,
      categories,
      biomarkers,
      healthWinners,
      areasToImprove,
      getCategoryBiomarkers,
      getGoalBiomarkers,
      totalCategoryCount,
      // Reveal state
      reveal: revealData?.reveal ?? null,
      lastCompletedPhase: revealData?.lastCompletedPhase ?? 'not_started',
      isRevealLoading,
      shouldShowReveal: revealData?.shouldShow ?? false,
      markPhaseComplete,
      saveShopifyOrder,
      completeReveal,
      shopifyInvoiceUrl: revealData?.reveal?.shopifyInvoiceUrl ?? null,
    }),
    [
      stepper,
      isLoading,
      protocol,
      goals,
      getGoal,
      categories,
      biomarkers,
      healthWinners,
      areasToImprove,
      getCategoryBiomarkers,
      getGoalBiomarkers,
      totalCategoryCount,
      revealData,
      isRevealLoading,
      markPhaseComplete,
      saveShopifyOrder,
      completeReveal,
    ],
  );

  return (
    <ProtocolStepperContext.Provider value={value}>
      {children}
    </ProtocolStepperContext.Provider>
  );
};

export const useProtocolStepperContext = () => {
  const context = useContext(ProtocolStepperContext);
  if (!context) {
    throw new Error(
      'useProtocolStepperContext must be used within ProtocolStepperProvider',
    );
  }
  return context;
};
