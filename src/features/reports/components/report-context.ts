import { createContext, useContext } from 'react';

import type { ParsedReport } from '../types';

interface ReportContextValue {
  report: ParsedReport;
  sourceId: string;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export const ReportProvider = ReportContext.Provider;

export function useReport() {
  const ctx = useContext(ReportContext);
  if (ctx == null)
    throw new Error('useReport must be used within ReportProvider');
  return ctx;
}
