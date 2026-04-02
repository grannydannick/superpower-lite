const TENSION = 0.3;

type Point = { x: number; y: number };

/**
 * Gentle Catmull-Rom spline — very low tension for a subtle rounding
 * effect while keeping the chart mostly linear.
 */
export function catmullRomToPath(
  points: Point[],
  tension: number = TENSION,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;
  }

  const alpha = tension;
  const parts: string[] = [`M${points[0].x},${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * (alpha / 6);
    const cp1y = p1.y + (p2.y - p0.y) * (alpha / 6);
    const cp2x = p2.x - (p3.x - p1.x) * (alpha / 6);
    const cp2y = p2.y - (p3.y - p1.y) * (alpha / 6);

    parts.push(`C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`);
  }

  return parts.join('');
}
