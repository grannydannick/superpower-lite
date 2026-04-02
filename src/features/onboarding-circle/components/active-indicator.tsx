import { Check } from 'lucide-react';

export function ActiveIndicator() {
  return (
    <div className="relative size-[44px] shrink-0">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="absolute inset-0">
        <g filter="url(#filter0_dd_active_ind)">
          <rect x="8" y="4" width="28" height="28" rx="14" fill="white" shapeRendering="crispEdges" />
          <rect x="8.5" y="4.5" width="27" height="27" rx="13.5" stroke="#E4E4E7" shapeRendering="crispEdges" />
        </g>
        <defs>
          <filter id="filter0_dd_active_ind" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.025 0" />
            <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-3 top-2 animate-spin" style={{ animationDuration: '4s' }}>
        <circle cx="10" cy="2.29" r="0.625" fill="#FC5F2B" />
        <circle cx="2.29" cy="9.79" r="0.625" fill="#FC5F2B" />
        <circle cx="17.71" cy="9.79" r="0.625" fill="#FC5F2B" />
        <circle cx="10" cy="17.71" r="0.625" fill="#FC5F2B" />
        <circle cx="4.55" cy="4.55" r="0.625" fill="#FC5F2B" />
        <circle cx="4.55" cy="15.3" r="0.625" fill="#FC5F2B" />
        <circle cx="15.3" cy="4.55" r="0.625" fill="#FC5F2B" />
        <circle cx="15.3" cy="15.3" r="0.625" fill="#FC5F2B" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-3 top-2">
        <circle cx="10" cy="10" r="5.42" fill="#FC5F2B" />
      </svg>
    </div>
  );
}

export function CompleteIndicator() {
  return (
    <div className="flex size-[44px] shrink-0 items-center justify-center">
      <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500">
        <Check size={16} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
