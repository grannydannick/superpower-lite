export interface WearableMetric {
  key: string;
  label: string;
  resource: string;
  accessor: (row: Record<string, any>) => number | null;
  unit: string;
  format: (value: number) => string;
  timestampAccessor: (row: Record<string, any>) => string;
  group: string;
  sourceAccessor: (row: Record<string, any>) => string;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatHoursMinutes(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${pad(m)}`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function formatDecimal(value: number) {
  return value.toFixed(1);
}

function formatPercent(value: number) {
  return `${Math.round(value)}`;
}

function getSourceName(row: Record<string, any>) {
  return row.source?.provider ?? row.provider ?? '';
}

/** Hotfix: override raw source names for display. Remove once backend sends proper names. */
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  apple_health_kit: 'Apple Health',
};

export function formatSourceName(raw: string) {
  return SOURCE_DISPLAY_NAMES[raw] ?? raw;
}

function getTimestamp(row: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    if (row[key]) return row[key] as string;
  }
  return row.date ?? row.calendarDate ?? '';
}

export const WEARABLE_METRICS: WearableMetric[] = [
  // Sleep
  {
    key: 'sleep_duration',
    label: 'Duration',
    resource: 'sleep',
    accessor: (row) => {
      const sec = row.durationSecond ?? row.duration;
      return sec != null ? sec / 3600 : null;
    },
    unit: 'h',
    format: (v) => formatHoursMinutes(v),
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_score',
    label: 'Sleep Score',
    resource: 'sleep',
    accessor: (row) => row.sleepScore ?? row.score ?? null,
    unit: '',
    format: formatNumber,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_efficiency',
    label: 'Efficiency',
    resource: 'sleep',
    accessor: (row) => row.efficiency ?? null,
    unit: '%',
    format: formatPercent,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_hrv',
    label: 'HRV',
    resource: 'sleep',
    accessor: (row) => row.hrvMeanRmssd ?? row.averageHrv ?? null,
    unit: 'ms',
    format: formatNumber,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_hr_avg',
    label: 'Avg Heart Rate',
    resource: 'sleep',
    accessor: (row) => row.heartRateMean ?? row.hrAverage ?? null,
    unit: 'bpm',
    format: formatNumber,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_respiratory',
    label: 'Respiratory Rate',
    resource: 'sleep',
    accessor: (row) => row.respiratoryRate ?? null,
    unit: 'brpm',
    format: formatDecimal,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_deep',
    label: 'Deep Sleep',
    resource: 'sleep',
    accessor: (row) => {
      const sec = row.stageDeepSecond ?? row.deep;
      return sec != null ? sec / 3600 : null;
    },
    unit: 'h',
    format: (v) => formatHoursMinutes(v),
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },
  {
    key: 'sleep_rem',
    label: 'REM Sleep',
    resource: 'sleep',
    accessor: (row) => {
      const sec = row.stageRemSecond ?? row.rem;
      return sec != null ? sec / 3600 : null;
    },
    unit: 'h',
    format: (v) => formatHoursMinutes(v),
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'bedtimeStop', 'date'),
    group: 'Sleep',
    sourceAccessor: getSourceName,
  },

  // Activity
  {
    key: 'activity_steps',
    label: 'Steps',
    resource: 'activity',
    accessor: (row) => row.steps ?? null,
    unit: 'steps',
    format: formatNumber,
    timestampAccessor: (row) => getTimestamp(row, 'date'),
    group: 'Activity',
    sourceAccessor: getSourceName,
  },
  {
    key: 'activity_calories',
    label: 'Calories',
    resource: 'activity',
    accessor: (row) => row.caloriesTotal ?? null,
    unit: 'kcal',
    format: formatNumber,
    timestampAccessor: (row) => getTimestamp(row, 'date'),
    group: 'Activity',
    sourceAccessor: getSourceName,
  },
  {
    key: 'activity_calories_active',
    label: 'Active Calories',
    resource: 'activity',
    accessor: (row) => row.caloriesActive ?? null,
    unit: 'kcal',
    format: formatNumber,
    timestampAccessor: (row) => getTimestamp(row, 'date'),
    group: 'Activity',
    sourceAccessor: getSourceName,
  },
  {
    key: 'activity_hr_avg',
    label: 'Avg Heart Rate',
    resource: 'activity',
    accessor: (row) => row.heartRateMean ?? row.heartRate?.avgBpm ?? null,
    unit: 'bpm',
    format: formatNumber,
    timestampAccessor: (row) => getTimestamp(row, 'date'),
    group: 'Activity',
    sourceAccessor: getSourceName,
  },

  // Body
  {
    key: 'body_weight',
    label: 'Weight',
    resource: 'body',
    accessor: (row) => row.weightKilogram ?? row.weight ?? null,
    unit: 'kg',
    format: formatDecimal,
    timestampAccessor: (row) => getTimestamp(row, 'measuredAt', 'date'),
    group: 'Body',
    sourceAccessor: getSourceName,
  },

  // Workouts
  {
    key: 'workout_calories',
    label: 'Workout Calories',
    resource: 'workouts',
    accessor: (row) => row.calories ?? null,
    unit: 'kcal',
    format: formatNumber,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'timeEnd', 'date'),
    group: 'Workouts',
    sourceAccessor: getSourceName,
  },
  {
    key: 'workout_duration',
    label: 'Workout Duration',
    resource: 'workouts',
    accessor: (row) => {
      const start = row.sessionStart ?? row.timeStart;
      const end = row.sessionEnd ?? row.timeEnd;
      if (!start || !end) return null;
      return (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
    },
    unit: 'h',
    format: (v) => formatHoursMinutes(v),
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'timeEnd', 'date'),
    group: 'Workouts',
    sourceAccessor: getSourceName,
  },
  {
    key: 'workout_hr_avg',
    label: 'Workout Avg HR',
    resource: 'workouts',
    accessor: (row) => row.heartRateMean ?? row.averageHr ?? null,
    unit: 'bpm',
    format: formatNumber,
    timestampAccessor: (row) =>
      getTimestamp(row, 'sessionEnd', 'timeEnd', 'date'),
    group: 'Workouts',
    sourceAccessor: getSourceName,
  },
];

export function getMetricsForResource(resource: string) {
  return WEARABLE_METRICS.filter((m) => m.resource === resource);
}

export function getAvailableMetrics(latest: Record<string, unknown>) {
  return WEARABLE_METRICS.filter((metric) => {
    const resourceData = latest[metric.resource];
    if (resourceData == null || typeof resourceData !== 'object') return false;
    const value = metric.accessor(resourceData as Record<string, any>);
    return value != null;
  });
}
