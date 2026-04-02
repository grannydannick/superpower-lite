import type { Biomarker } from '@/types/api';

const CONFIG = {
  ICON_RADIUS: 18,
  LEFT_PADDING: 60,
  RIGHT_PADDING: 60,
  BOTTOM_PADDING: 50,
  STROKE_WIDTH: 2,
  ITEMS_PER_PAGE_MOBILE: 3,
  ITEMS_PER_PAGE_DESKTOP: 6,
} as const;

const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export interface TextDataPoint {
  x: number;
  y: number;
  text: string;
  timestamp: string;
  source: string;
  id: string;
  file?: { id: string; name: string };
}

export interface TextXAxisLabel {
  label: string;
  x: number;
  y: number;
  key: string;
}

// Computes layout geometry for the text-value detail chart.
// Text biomarkers have no numeric value -- just free-text lab comments.
// All icons sit on a fixed horizontal center line with even spacing.
export const useTextValueChart = ({
  biomarker,
  svgWidth,
  svgHeight,
  isMobile,
  currentPage = 0,
  itemsPerPage = 6,
}: {
  biomarker: Biomarker;
  svgWidth: number;
  svgHeight: number;
  isMobile: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}) => {
  if (!biomarker.value?.length) {
    return {
      meta: {
        hasData: false,
        totalPages: 0,
        showPagination: false,
      },
      data: {
        dataPoints: [] as TextDataPoint[],
        nextTestX: null as number | null,
        xAxisLabels: [] as TextXAxisLabel[],
      },
      config: CONFIG,
    };
  }

  // Sort oldest first for left-to-right display
  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const totalValues = sortedValues.length;
  const totalPages = Math.ceil(totalValues / itemsPerPage);
  const showPagination = totalPages > 1;
  const shouldShowNextTest = currentPage === 0;

  const endIndex = totalValues - currentPage * itemsPerPage;
  const startIndex = Math.max(0, endIndex - itemsPerPage);
  const pageValues = sortedValues.slice(startIndex, endIndex);

  const chartWidth = svgWidth - CONFIG.LEFT_PADDING - CONFIG.RIGHT_PADDING;
  const centerY = svgHeight * 0.4;

  const dataPoints: TextDataPoint[] = pageValues.map((point, index) => {
    const totalPointsForSpacing = shouldShowNextTest
      ? pageValues.length + 1
      : pageValues.length;

    let x: number;
    if (totalPointsForSpacing === 1) {
      x = CONFIG.LEFT_PADDING + chartWidth / 2;
    } else if (pageValues.length === 1 && shouldShowNextTest) {
      x = CONFIG.LEFT_PADDING + chartWidth * 0.25;
    } else {
      x =
        CONFIG.LEFT_PADDING +
        (index / (totalPointsForSpacing - 1)) * chartWidth;
    }

    return {
      x,
      y: centerY,
      text: point.valueText || '',
      timestamp: point.timestamp,
      source: point.source || 'quest',
      file: point.file,
      id: point.id || `point-${startIndex + index}`,
    };
  });

  // Next test position
  let nextTestX: number | null = null;
  if (shouldShowNextTest && dataPoints.length > 0) {
    if (pageValues.length === 1) {
      nextTestX = CONFIG.LEFT_PADDING + chartWidth * 0.85;
    } else {
      const totalPointsForSpacing = pageValues.length + 1;
      nextTestX =
        CONFIG.LEFT_PADDING +
        (pageValues.length / (totalPointsForSpacing - 1)) * chartWidth;
    }
  }

  // X-axis labels
  const responsiveLabelWidth = isMobile ? 80 : 100;
  const edgePadding = responsiveLabelWidth / 2;
  const minXLabelSpacing = isMobile ? 80 : 100;
  const availableWidth = svgWidth - 2 * edgePadding;
  const maxLabels = Math.floor(availableWidth / minXLabelSpacing);

  const xAxisLabels: TextXAxisLabel[] = [];

  if (dataPoints.length <= maxLabels) {
    dataPoints.forEach((point, index) => {
      xAxisLabels.push({
        label: formatDateLabel(new Date(point.timestamp)),
        x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
        y: svgHeight - 16,
        key: `x-label-${index}`,
      });
    });
  } else {
    const step = Math.ceil(dataPoints.length / maxLabels);
    for (let i = 0; i < dataPoints.length; i += step) {
      const point = dataPoints[i];
      xAxisLabels.push({
        label: formatDateLabel(new Date(point.timestamp)),
        x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
        y: svgHeight - 16,
        key: `x-label-${i}`,
      });
    }
  }

  xAxisLabels.sort((a, b) => a.x - b.x);

  return {
    meta: {
      hasData: true,
      totalPages,
      showPagination,
    },
    data: {
      dataPoints,
      nextTestX,
      xAxisLabels,
    },
    config: CONFIG,
  };
};
