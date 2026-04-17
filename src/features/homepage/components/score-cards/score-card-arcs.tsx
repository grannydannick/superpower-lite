import { useId } from 'react';

interface ScoreArcProps {
  progress: number;
  size?: number;
}

export const ScoreArc = ({ progress, size = 150 }: ScoreArcProps) => {
  const strokeWidth = 5;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = 170;
  const startAngle = 185;
  const arcLength = (sweep / 360) * circumference;
  const gapLength = circumference - arcLength;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const progressLength = arcLength * clamped;

  const startRad = (startAngle * Math.PI) / 180;
  const endAngle = startAngle + clamped * sweep;
  const endRad = (endAngle * Math.PI) / 180;
  const largeArc = clamped * sweep > 180 ? 1 : 0;

  return (
    <svg width={size} height={size} overflow="visible">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={`rotate(${startAngle} ${center} ${center})`}
      />
      <path
        d={`M ${center + radius * Math.cos(startRad)} ${center + radius * Math.sin(startRad)} A ${radius} ${radius} 0 ${largeArc} 1 ${center + radius * Math.cos(endRad)} ${center + radius * Math.sin(endRad)}`}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          strokeDasharray: progressLength,
          strokeDashoffset: progressLength,
          animation: 'bio-arc-expand 1s ease-out 0.5s forwards',
        }}
      />
      <circle
        cx={center + radius * Math.cos(endRad)}
        cy={center + radius * Math.sin(endRad)}
        r={8}
        fill="rgba(255,255,255,0.3)"
        style={{
          opacity: 0,
          animation: 'bio-dot-fade 0.4s ease-out 1.4s forwards',
        }}
      />
      <circle
        cx={center + radius * Math.cos(endRad)}
        cy={center + radius * Math.sin(endRad)}
        r={4}
        fill="white"
        style={{
          opacity: 0,
          animation: 'bio-dot-fade 0.4s ease-out 1.4s forwards',
        }}
      />
    </svg>
  );
};

interface BioAgeArcProps {
  bioAge: number;
  realAge: number;
  size?: number;
}

export const BioAgeArc = ({ bioAge, realAge, size = 150 }: BioAgeArcProps) => {
  const deltaGradientId = useId().replaceAll(':', '');
  const strokeWidth = 5;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = 170;
  const arcLength = (sweep / 360) * circumference;
  const gapLength = circumference - arcLength;

  const maxAge = 80;
  const midpoint = (bioAge + realAge) / 2 / maxAge;
  const rawDelta = (realAge - bioAge) / maxAge;
  const visualDelta =
    Math.max(Math.abs(rawDelta) * 3, 0.15) * Math.sign(rawDelta);
  const bioFraction = Math.max(0, Math.min(1, midpoint - visualDelta / 2));
  const realFraction = Math.max(0, Math.min(1, midpoint + visualDelta / 2));
  const deltaLength = arcLength * Math.abs(realFraction - bioFraction);

  const startAngle = 185;
  const totalAngle = sweep;
  const bioAngle = ((startAngle + bioFraction * totalAngle) * Math.PI) / 180;
  const realAngle = ((startAngle + realFraction * totalAngle) * Math.PI) / 180;
  const deltaStartAngle = bioFraction > realFraction ? bioAngle : realAngle;
  const deltaEndAngle = bioFraction > realFraction ? realAngle : bioAngle;

  return (
    <svg width={size} height={size} overflow="visible">
      <defs>
        <linearGradient
          id={deltaGradientId}
          x1={center + radius * Math.cos(realAngle)}
          y1={center + radius * Math.sin(realAngle)}
          x2={center + radius * Math.cos(bioAngle)}
          y2={center + radius * Math.sin(bioAngle)}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={`rotate(${startAngle} ${center} ${center})`}
      />
      <path
        d={`M ${center + radius * Math.cos(deltaStartAngle)} ${center + radius * Math.sin(deltaStartAngle)} A ${radius} ${radius} 0 0 0 ${center + radius * Math.cos(deltaEndAngle)} ${center + radius * Math.sin(deltaEndAngle)}`}
        fill="none"
        stroke={`url(#${deltaGradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          strokeDasharray: deltaLength,
          strokeDashoffset: deltaLength,
          animation: 'bio-arc-expand 1s ease-out 0.5s forwards',
        }}
      />
      <circle
        cx={center + radius * Math.cos(bioAngle)}
        cy={center + radius * Math.sin(bioAngle)}
        r={8}
        fill="rgba(52,211,153,0.3)"
        style={{
          opacity: 0,
          animation: 'bio-dot-fade 0.4s ease-out 1.4s forwards',
        }}
      />
      <circle
        cx={center + radius * Math.cos(bioAngle)}
        cy={center + radius * Math.sin(bioAngle)}
        r={4}
        fill="#34d399"
        style={{
          opacity: 0,
          animation: 'bio-dot-fade 0.4s ease-out 1.4s forwards',
        }}
      />
      <circle
        cx={center + radius * Math.cos(realAngle)}
        cy={center + radius * Math.sin(realAngle)}
        r={8}
        fill="rgba(255,255,255,0.3)"
      />
      <circle
        cx={center + radius * Math.cos(realAngle)}
        cy={center + radius * Math.sin(realAngle)}
        r={4}
        fill="white"
      />
    </svg>
  );
};
