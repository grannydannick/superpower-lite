import { useCallback, useMemo } from 'react';

import { BiomarkerStatus, CategoryValue } from '@/types/api';

import { getBiomarkerColor } from '../utils/get-biomarker-color';
import { sortBiomarkers } from '../utils/sort-biomarkers';

import { CHART_CONFIG } from './config';
import {
  MergedSegment,
  ScoredBiomarker,
  SegmentData,
  SegmentPath,
} from './types/score-chart';

export const useScoreChart = (
  biomarkers: ScoredBiomarker[],
  value?: CategoryValue,
  size: number = CHART_CONFIG.DEFAULT_SIZE,
) => {
  const config = CHART_CONFIG;

  const meta = useMemo(
    () => ({
      biomarkerCount: biomarkers.length,
      showLabels: size > config.LARGE_CHART_THRESHOLD,
    }),
    [biomarkers.length, size, config.LARGE_CHART_THRESHOLD],
  );

  const dimensions = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * config.OUTER_RADIUS_FACTOR;
    const innerRadius = size * config.INNER_RADIUS_FACTOR;
    const expandedOuterRadius = size * config.EXPANDED_OUTER_RADIUS_FACTOR;
    const expandedInnerRadius = size * config.EXPANDED_INNER_RADIUS_FACTOR;

    return {
      centerX,
      centerY,
      outerRadius,
      innerRadius,
      expandedOuterRadius,
      expandedInnerRadius,
      size,
    };
  }, [size, config]);

  const sortedBiomarkers = useMemo(() => {
    return sortBiomarkers(biomarkers);
  }, [biomarkers]);

  const calculateSegmentAngles = useMemo(() => {
    const totalBiomarkers = biomarkers.length;
    const segmentAngle =
      (360 - totalBiomarkers * config.GAP_ANGLE) / totalBiomarkers;

    return { segmentAngle, gapAngle: config.GAP_ANGLE };
  }, [biomarkers.length, config.GAP_ANGLE]);

  const createSegmentPath = useCallback(
    (
      centerX: number,
      centerY: number,
      innerRadius: number,
      outerRadius: number,
      startAngle: number,
      endAngle: number,
    ): string => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const innerStartPoint = {
        x: centerX + innerRadius * Math.cos(startAngleRad),
        y: centerY + innerRadius * Math.sin(startAngleRad),
      };

      const outerStartPoint = {
        x: centerX + outerRadius * Math.cos(startAngleRad),
        y: centerY + outerRadius * Math.sin(startAngleRad),
      };

      const outerEndPoint = {
        x: centerX + outerRadius * Math.cos(endAngleRad),
        y: centerY + outerRadius * Math.sin(endAngleRad),
      };

      const innerEndPoint = {
        x: centerX + innerRadius * Math.cos(endAngleRad),
        y: centerY + innerRadius * Math.sin(endAngleRad),
      };

      const isLargeArc = endAngle - startAngle <= 180 ? '0' : '1';

      const pathCommands = [
        `M ${innerStartPoint.x} ${innerStartPoint.y}`,
        `L ${outerStartPoint.x} ${outerStartPoint.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${isLargeArc} 1 ${outerEndPoint.x} ${outerEndPoint.y}`,
        `L ${innerEndPoint.x} ${innerEndPoint.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${isLargeArc} 0 ${innerStartPoint.x} ${innerStartPoint.y}`,
        'Z',
      ];

      return pathCommands.join(' ');
    },
    [],
  );

  const createFullCirclePath = useCallback(
    (
      centerX: number,
      centerY: number,
      innerRadius: number,
      outerRadius: number,
    ): string => {
      const pathCommands = [
        `M ${centerX - outerRadius} ${centerY}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${
          centerX + outerRadius
        } ${centerY}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${
          centerX - outerRadius
        } ${centerY}`,
        `M ${centerX - innerRadius} ${centerY}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${
          centerX + innerRadius
        } ${centerY}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${
          centerX - innerRadius
        } ${centerY}`,
        'Z',
      ];
      return pathCommands.join(' ');
    },
    [],
  );

  const mergedSegments = useMemo((): MergedSegment[] => {
    const segments: MergedSegment[] = [];
    let currentGroup: { biomarker: ScoredBiomarker; index: number }[] = [];
    let currentColor: string | null = null;
    let currentStatus: BiomarkerStatus | null = null;

    sortedBiomarkers.forEach((biomarker, index) => {
      const status = biomarker.status;
      const color = getBiomarkerColor(status).default;

      if (color === currentColor) {
        currentGroup.push({ biomarker, index });
      } else {
        if (currentGroup.length > 0 && currentStatus !== null) {
          segments.push({
            status: currentStatus,
            color: currentColor!,
            startIndex: currentGroup[0].index,
            endIndex: currentGroup[currentGroup.length - 1].index,
            count: currentGroup.length,
          });
        }
        currentGroup = [{ biomarker, index }];
        currentColor = color;
        currentStatus = status;
      }
    });

    if (currentGroup.length > 0 && currentStatus !== null) {
      segments.push({
        status: currentStatus,
        color: currentColor!,
        startIndex: currentGroup[0].index,
        endIndex: currentGroup[currentGroup.length - 1].index,
        count: currentGroup.length,
      });
    }

    return segments;
  }, [sortedBiomarkers]);

  const segmentPaths = useMemo((): SegmentPath[] => {
    if (biomarkers.length === 0 && value) {
      const path = createFullCirclePath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.expandedInnerRadius,
        dimensions.expandedOuterRadius,
      );

      return [
        {
          key: 'full-circle-background',
          path,
          fill: getBiomarkerColor(value).light,
          stroke: getBiomarkerColor(value).light,
        },
      ];
    }

    const { segmentAngle, gapAngle } = calculateSegmentAngles;

    return mergedSegments.map((segment, mergedIndex) => {
      const startAngle = segment.startIndex * (segmentAngle + gapAngle);
      const endAngle =
        segment.endIndex * (segmentAngle + gapAngle) + segmentAngle;

      const path = createSegmentPath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.expandedInnerRadius,
        dimensions.expandedOuterRadius,
        startAngle,
        endAngle,
      );

      return {
        key: `merged-${mergedIndex}`,
        path,
        fill: getBiomarkerColor(segment.status).light,
        stroke: getBiomarkerColor(segment.status).light,
      };
    });
  }, [
    biomarkers.length,
    value,
    dimensions,
    createFullCirclePath,
    mergedSegments,
    calculateSegmentAngles,
    createSegmentPath,
  ]);

  const segments = useMemo((): SegmentData[] => {
    if (biomarkers.length === 0 && value) {
      const normalPath = createFullCirclePath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.innerRadius,
        dimensions.outerRadius,
      );

      const expandedPath = createFullCirclePath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.expandedInnerRadius,
        dimensions.expandedOuterRadius,
      );

      const touchAreaPath = createFullCirclePath(
        dimensions.centerX,
        dimensions.centerY,
        0,
        dimensions.expandedOuterRadius,
      );

      return [
        {
          biomarker: {
            id: 'full-circle',
            name: 'Category',
            status: value as BiomarkerStatus,
          },
          index: 0,
          startAngle: 0,
          endAngle: 360,
          normalPath,
          expandedPath,
          touchAreaPath,
          color: getBiomarkerColor(value).default,
          status: value as BiomarkerStatus,
        },
      ];
    }

    const { segmentAngle, gapAngle } = calculateSegmentAngles;

    return sortedBiomarkers.map((biomarker, index) => {
      const startAngle = index * (segmentAngle + gapAngle);
      const endAngle = startAngle + segmentAngle;
      const status = biomarker.status;
      const color = getBiomarkerColor(status).default;

      const normalPath = createSegmentPath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.innerRadius,
        dimensions.outerRadius,
        startAngle,
        endAngle,
      );

      const expandedPath = createSegmentPath(
        dimensions.centerX,
        dimensions.centerY,
        dimensions.expandedInnerRadius,
        dimensions.expandedOuterRadius,
        startAngle,
        endAngle,
      );

      const touchAreaPath = createSegmentPath(
        dimensions.centerX,
        dimensions.centerY,
        0,
        dimensions.expandedOuterRadius,
        startAngle,
        endAngle,
      );

      return {
        biomarker,
        index,
        startAngle,
        endAngle,
        normalPath,
        expandedPath,
        touchAreaPath,
        color,
        status,
      };
    });
  }, [
    biomarkers.length,
    value,
    dimensions,
    createFullCirclePath,
    sortedBiomarkers,
    calculateSegmentAngles,
    createSegmentPath,
  ]);

  return {
    meta,
    dimensions,
    config,
    data: {
      sortedBiomarkers,
      segments,
      segmentPaths,
      mergedSegments,
    },
  };
};
