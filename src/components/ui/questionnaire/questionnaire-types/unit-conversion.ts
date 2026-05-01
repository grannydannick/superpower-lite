// ── Conversion factors ──────────────────────────────────────────────

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const LB_PER_KG = 2.20462;

// ── Converters ──────────────────────────────────────────────────────

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH);
}

export function cmToFeetInches(cm: number): {
  feet: number;
  inches: number;
} {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function lbToKg(lb: number): number {
  return Math.round((lb / LB_PER_KG) * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * LB_PER_KG);
}

// ── Default values ──────────────────────────────────────────────────

export const DEFAULT_HEIGHT_FEET = 5;
export const DEFAULT_HEIGHT_INCHES = 6;
export const DEFAULT_WEIGHT_LBS = 120;

// ── Picker ranges ───────────────────────────────────────────────────
// Imperial is the source of truth (matches the storage format).
// Metric ranges are derived so every value in one system converts
// to a value within the other system's picker range.

export const HEIGHT_FEET_MIN = 2;
export const HEIGHT_FEET_MAX = 7;
export const HEIGHT_INCHES_MIN = 0;
export const HEIGHT_INCHES_MAX = 11;
export const HEIGHT_CM_MIN = feetInchesToCm(HEIGHT_FEET_MIN, HEIGHT_INCHES_MIN);
export const HEIGHT_CM_MAX = feetInchesToCm(HEIGHT_FEET_MAX, HEIGHT_INCHES_MAX);

export const WEIGHT_LB_MIN = 60;
export const WEIGHT_LB_MAX = 460;
export const WEIGHT_KG_MIN = Math.ceil(lbToKg(WEIGHT_LB_MIN));
export const WEIGHT_KG_MAX = Math.floor(lbToKg(WEIGHT_LB_MAX));

// ── Range builders (used by ScrollPicker) ───────────────────────────

export function buildRange(min: number, max: number): number[] {
  const result: number[] = [];
  for (let i = min; i <= max; i++) {
    result.push(i);
  }
  return result;
}
