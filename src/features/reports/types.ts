export interface ReportMetric {
  value: number;
  unit: string;
  label: string;
  identity: string;
  status: 'healthy' | 'good' | 'alert' | 'neutral';
  tag: string;
  direction?: 'up' | 'down';
}

export interface ReportConnection {
  metricIndex: number;
  sources: string[];
  headline: string;
  body: string;
  callout: {
    label: string;
    text: string;
  };
}

export interface ReportCorrelation {
  from: { emoji: string; label: string };
  to: { emoji: string; label: string };
  identity: string;
  body: string;
  connection: {
    sources: string[];
    headline: string;
    body: string;
    callout: {
      label: string;
      text: string;
    };
  };
}

export interface ReportNextStep {
  emoji: string;
  title: string;
  detail: string;
}

export interface ParsedReport {
  title: string;
  source: string;
  metrics: ReportMetric[];
  connections: ReportConnection[];
  correlation: ReportCorrelation | null;
  nextSteps: ReportNextStep[];
  ctaQuestions: string[];
  summary: string;
}
