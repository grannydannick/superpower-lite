import { Upload } from 'lucide-react';

import { cn } from '@/lib/utils';

export function LabUploadDropzone({
  isDragActive,
  onClick,
}: {
  isDragActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative mx-auto mb-1 flex w-full max-w-3xl flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed px-4 py-5 text-center outline-none transition-[border-color,background-color,box-shadow,color] duration-200 focus-visible:ring-2 focus-visible:ring-ring',
        isDragActive
          ? 'border-transparent'
          : 'border-zinc-300 bg-zinc-100 hover:border-zinc-200 hover:bg-zinc-100/50',
      )}
    >
      {isDragActive && (
        <svg
          className="absolute inset-0 z-10 size-full text-vermillion-900 animate-in fade-in"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            x="1"
            y="1"
            rx="16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="12;0"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      )}
      <div className="mb-2 p-1.5 pb-0 rounded-mask">
        <img
          src="/concierge/lab-upload.webp"
          alt=""
          className="size-20 w-auto shrink-0 translate-y-3 object-contain transition-all ease-out group-hover:rotate-3"
        />
      </div>
      <div
        className={cn(
          'flex items-center gap-2 text-sm font-medium text-zinc-400',
        )}
      >
        <Upload
          size={16}
          aria-hidden="true"
          className={cn(
            'transition-all duration-200 ease-out',
            isDragActive && '-translate-y-1 rotate-6',
          )}
        />
        <span>Upload past labs</span>
      </div>
      <span className="text-xs text-zinc-400">
        Drop PDF files here or click
      </span>
    </button>
  );
}
