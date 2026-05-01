import { m } from 'framer-motion';

import {
  DEFAULT_IMAGE_LAYER_READY_DELAY_MS,
  useImageLayerReady,
} from '@/hooks/use-image-layer-ready';
import { cn } from '@/lib/utils';

export interface DomeImageProps {
  src: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
  /** Percent along the radial gradient where the clear center ends and the blur feather begins (0–85). */
  blurRingInnerRadiusPercent?: number;
  hasTransition?: boolean;
  /** Extra class names merged onto the inner `<img>` element. */
  imageClassName?: string;
  /** Visible dome height in px. Defaults to 340. Bottom fade scales with this. */
  height?: number;
}

const DOME_FADE_BG = '250, 250, 250';

/**
 * Inner radius for the crisp top mask (percent of ellipse). Matches the soft overlay’s
 * `transparent 50%` origin so the hard edge sits on the same oval without a second feather.
 */
const DOME_HARD_EDGE_INNER_STOP_PCT = 16;

/** Transparent stop for that ellipse; pairs with `DOME_HARD_EDGE_INNER_STOP_PCT` for the solid edge. */
const DOME_HARD_EDGE_TRANSPARENT_STOP_PCT = 6;

/** Interpolated stops shared by the mask and zinc vignette builders (7 steps between endpoints). */
const FEATHER_STOP_COUNT = 8;

/** Extra delay on the blur ring only, measured from when the dome becomes visible. */
const DOME_BLUR_RING_STAGGER_S = 0.5;

const DOME_MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Default visible dome height in px when `height` prop is not provided. */
const DOME_DEFAULT_HEIGHT_PX = 340;

/** How far the inner frame extends below the outer container (gives the bottom fade room to clip). */
const DOME_BOTTOM_EXTENSION_PX = 80;

/** Total height of the bottom zinc blur ellipse (constant — defines the fade falloff length). */
const DOME_BOTTOM_BLUR_HEIGHT_PX = 500;

/** Height of the visible bottom fade (distance the blur ellipse rises above the bottom clip). */
const DOME_BOTTOM_FADE_HEIGHT_PX = 190;

interface DomeFeatheredRadialGradientParams {
  innerRadiusPercent: number;
  outerRadiusPercent: number;
  /** Comma-separated RGB components, e.g. `255, 255, 255` or `DOME_FADE_BG`. */
  rgb: string;
  /** Mask uses a final `rgba(..., 1)` stop; zinc overlay uses `rgb(...)` to match prior output. */
  edgeKind: 'mask' | 'overlay';
}

/** Shared feathered ellipse gradient: transparent center, cubic ease through `FEATHER_STOP_COUNT` stops. */
function domeFeatheredRadialGradientString(
  params: DomeFeatheredRadialGradientParams,
) {
  const {
    innerRadiusPercent: inner,
    outerRadiusPercent: outer,
    rgb,
    edgeKind,
  } = params;
  let out = `ellipse at center, transparent ${inner}%`;
  for (let i = 1; i < FEATHER_STOP_COUNT; i++) {
    const t = i / FEATHER_STOP_COUNT;
    const pos = Math.min(inner + (outer - inner) * t, 100);
    const amount = 1 - (1 - t) ** 3;
    out += `, rgba(${rgb}, ${amount.toFixed(4)}) ${pos.toFixed(2)}%`;
  }
  if (edgeKind === 'mask') {
    out += `, rgba(${rgb}, 1) ${outer}%`;
  } else {
    out += `, rgb(${rgb}) ${outer}%`;
  }
  return `radial-gradient(${out})`;
}

/**
 * Luminance mask: transparent in the center (no blur layer composited = sharp image), feathering
 * to opaque at the edge (backdrop blur visible). Same stop layout as the old zinc vignette, but
 * used as mask instead of background so there is no white fill.
 */
function domeBlurRingMaskGradientString(innerRadiusPercent: number) {
  const inner = Math.min(Math.max(innerRadiusPercent, 0), 85);
  const outer = Math.min(inner + 20, 100);
  return domeFeatheredRadialGradientString({
    innerRadiusPercent: inner,
    outerRadiusPercent: outer,
    rgb: '255, 255, 255',
    edgeKind: 'mask',
  });
}

function domeRadialGradientStringZincOverlay() {
  return domeFeatheredRadialGradientString({
    innerRadiusPercent: 50,
    outerRadiusPercent: 70,
    rgb: DOME_FADE_BG,
    edgeKind: 'overlay',
  });
}

export function DomeImage(props: DomeImageProps) {
  const {
    src,
    alt = '',
    loading = 'eager',
    blurRingInnerRadiusPercent = 10,
    hasTransition = false,
    imageClassName,
    height = DOME_DEFAULT_HEIGHT_PX,
  } = props;
  const bottomBlurTopPx =
    height + DOME_BOTTOM_EXTENSION_PX - DOME_BOTTOM_FADE_HEIGHT_PX;
  const { ready, imgRef, scheduleReveal } = useImageLayerReady({
    resetDeps: [src],
    delayMs: DEFAULT_IMAGE_LAYER_READY_DELAY_MS,
  });

  const enter = !hasTransition || ready;
  const blurRingDelayS = enter && hasTransition ? DOME_BLUR_RING_STAGGER_S : 0;
  const blurRingMask = domeBlurRingMaskGradientString(
    blurRingInnerRadiusPercent,
  );

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <div
        className="absolute -inset-x-14 top-0 overflow-hidden"
        style={{ bottom: `-${DOME_BOTTOM_EXTENSION_PX}px` }}
      >
        <div className="relative isolate h-full w-full transform-gpu [backface-visibility:hidden]">
          <m.img
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn(
              'h-full w-full origin-center transform-gpu object-cover object-[50%_20%] will-change-[transform,opacity] [backface-visibility:hidden]',
              imageClassName,
            )}
            loading={loading}
            onLoad={scheduleReveal}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={
              enter
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.9, y: 10 }
            }
            transition={{
              duration: hasTransition ? 2.8 : 0,
              ease: DOME_MOTION_EASE,
            }}
          />

          <m.div
            className="pointer-events-none absolute inset-0 origin-center transform-gpu bg-transparent bg-[length:100%_100%] bg-center backdrop-blur-[3px] will-change-[transform,opacity] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [backface-visibility:hidden] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%]"
            initial={{ scale: 2, y: 100, opacity: 1 }}
            animate={
              enter
                ? { scale: 5, y: 0, opacity: 1 }
                : { scale: 2, y: 100, opacity: 1 }
            }
            style={{ WebkitMaskImage: blurRingMask, maskImage: blurRingMask }}
            transition={{
              duration: hasTransition ? 2.8 : 0,
              ease: DOME_MOTION_EASE,
              delay: blurRingDelayS,
            }}
            aria-hidden
          />

          <m.div
            className="pointer-events-none absolute inset-0 origin-center transform-gpu bg-[length:100%_100%] bg-center blur-lg will-change-[transform,opacity] [backface-visibility:hidden]"
            style={{ background: domeRadialGradientStringZincOverlay() }}
            aria-hidden
            initial={{ scale: 0.2 }}
            animate={enter ? { scale: 1.2 } : { scale: 0.2 }}
            transition={{
              duration: hasTransition ? 1.8 : 0,
              ease: DOME_MOTION_EASE,
            }}
          />
          <m.div
            className="pointer-events-none absolute inset-0 origin-center transform-gpu bg-[length:100%_100%] bg-center will-change-[transform,opacity] [backface-visibility:hidden]"
            style={{
              background: `radial-gradient(ellipse at center, transparent ${DOME_HARD_EDGE_TRANSPARENT_STOP_PCT}%, rgb(${DOME_FADE_BG}) ${DOME_HARD_EDGE_INNER_STOP_PCT}%)`,
            }}
            aria-hidden
            initial={{ scale: 1 }}
            animate={enter ? { scale: 4.5 } : { scale: 1 }}
            transition={{
              duration: hasTransition ? 1.8 : 0,
              ease: DOME_MOTION_EASE,
            }}
          />
        </div>
        <div
          className="absolute -inset-x-40 transform-gpu rounded-[100%] bg-zinc-50 blur-xl [backface-visibility:hidden]"
          style={{
            top: `${bottomBlurTopPx}px`,
            height: `${DOME_BOTTOM_BLUR_HEIGHT_PX}px`,
          }}
        />
      </div>
    </div>
  );
}
