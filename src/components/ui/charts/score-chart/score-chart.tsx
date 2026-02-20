import { useEffect, useMemo, useRef, useState } from 'react';

import { Body2, Body3 } from '@/components/ui/typography';
import { Biomarker, CategoryValue } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { getBiomarkerColor } from '../utils/get-biomarker-color';

import { useScoreChart } from './use-score-chart';

export const ScoreChart = ({
  biomarkers,
  value,
  size = 120,
}: {
  biomarkers: Biomarker[];
  value?: CategoryValue;
  size?: number;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
    angle: number;
  }>({ x: 0, y: 0, angle: 0 });
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { meta, config, data } = useScoreChart(biomarkers, value, size);

  const calculateTooltipPosition = (segmentIndex: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * config.TOOLTIP_OFFSET_RADIUS_FACTOR;
    const totalBiomarkers = biomarkers.length;
    const segmentAngle =
      (360 - totalBiomarkers * config.GAP_ANGLE) / totalBiomarkers;

    const midAngle =
      segmentIndex * (segmentAngle + config.GAP_ANGLE) + segmentAngle / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;

    const x = centerX + outerRadius * Math.cos(midAngleRad);
    const y = centerY + outerRadius * Math.sin(midAngleRad);

    return { x, y, angle: midAngle };
  };

  const getTooltipSide = (
    angle: number,
  ): 'top' | 'right' | 'bottom' | 'left' => {
    const normalizedAngle = ((angle % 360) + 360) % 360;

    if (normalizedAngle >= 315 || normalizedAngle < 45) {
      return 'right';
    } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
      return 'bottom';
    } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
      return 'left';
    } else {
      return 'top';
    }
  };

  useEffect(() => {
    if (hoveredIndex !== null) {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
      setDisplayedIndex(hoveredIndex);
    } else {
      if (displayedIndex !== null) {
        cooldownTimeoutRef.current = setTimeout(() => {
          setDisplayedIndex(null);
          cooldownTimeoutRef.current = null;
        }, config.COOLDOWN_TIMEOUT);
      }
    }

    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
    };
  }, [hoveredIndex, displayedIndex, config.COOLDOWN_TIMEOUT]);

  const mergedSegmentPaths = data.segmentPaths.map((segmentPath) => (
    <path
      key={segmentPath.key}
      d={segmentPath.path}
      fill={segmentPath.fill}
      stroke={segmentPath.stroke}
      strokeWidth={config.STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ));

  const segments = data.segments.map((segment) => {
    const isHovered = hoveredIndex === segment.index;
    const hasInteraction = biomarkers.length > 0;

    const handleMouseEnter = () => {
      if (!hasInteraction) return;
      setHoveredIndex(segment.index);
      const position = calculateTooltipPosition(segment.index);
      setTooltipPosition(position);
    };

    const handleMouseLeave = () => {
      if (!hasInteraction) return;
      setHoveredIndex(null);
    };

    return (
      <g key={segment.biomarker.id}>
        <path
          d={isHovered ? segment.expandedPath : segment.normalPath}
          fill={segment.color}
          stroke={segment.color}
          strokeWidth={config.STROKE_WIDTH}
          strokeLinejoin="round"
          strokeLinecap="round"
          className={
            hasInteraction
              ? 'transition-timing-function-[cubic-bezier(0.4,0,0.2,1)] transition-[d,fill,stroke] duration-500'
              : ''
          }
        />
        {hasInteraction && (
          <path
            d={segment.touchAreaPath}
            fill="transparent"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </g>
    );
  });

  const tooltipContent = useMemo(() => {
    if (displayedIndex === null) return null;

    const displayedSegment = data.segments.find(
      (segment) => segment.index === displayedIndex,
    );
    if (!displayedSegment) return null;

    const displayedBiomarker = displayedSegment.biomarker;
    const displayedBiomarkerStatus = displayedBiomarker.status;

    if (biomarkers.length === 0 && value) {
      return null;
    }

    return (
      <div className="space-y-1">
        <Body3>{displayedBiomarker.name}</Body3>
        {displayedBiomarkerStatus && (
          <Body2>
            <span className="inline-flex items-center gap-1 align-middle">
              <span
                className="-mt-0.5 inline-block size-1.5 rounded-full align-middle"
                style={{
                  backgroundColor: getBiomarkerColor(displayedBiomarkerStatus)
                    .default,
                }}
              />
              <span
                className="capitalize leading-none"
                style={{
                  color: getBiomarkerColor(displayedBiomarkerStatus).default,
                }}
              >
                {displayedBiomarkerStatus.toLowerCase()}
              </span>
            </span>
          </Body2>
        )}
      </div>
    );
  }, [displayedIndex, data.segments, biomarkers.length, value]);

  return (
    <div className="relative z-10 mx-auto inline-block aspect-square">
      <svg width={size} height={size} className="-rotate-90">
        {mergedSegmentPaths}
        {segments}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            color: getBiomarkerColor(value ?? '-').default,
          }}
          className="text-2xl font-bold"
        >
          {value}
        </span>
        {meta.showLabels && (
          <Body3 className="max-w-20 truncate text-center text-zinc-500">
            {meta.biomarkerCount} Biomarkers
          </Body3>
        )}
      </div>

      <ChartTooltip
        className="min-w-36"
        isOpen={displayedIndex !== null}
        position={tooltipPosition}
        side={getTooltipSide(tooltipPosition.angle)}
      >
        {tooltipContent}
      </ChartTooltip>
    </div>
  );
};
