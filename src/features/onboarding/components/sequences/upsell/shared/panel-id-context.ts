import { createContext, useContext } from 'react';

export type PanelId =
  | 'heart'
  | 'fertility'
  | 'metabolic'
  | 'nutrients'
  | 'autoimmune'
  | 'methylation'
  | 'gut-microbiome';

const PanelIdContext = createContext<PanelId | null>(null);

export const PanelIdProvider = PanelIdContext.Provider;

export const usePanelId = () => useContext(PanelIdContext);

const UpsellPanelIdsContext = createContext<PanelId[]>([]);

export const UpsellPanelIdsProvider = UpsellPanelIdsContext.Provider;

export const useUpsellPanelIds = () => useContext(UpsellPanelIdsContext);
