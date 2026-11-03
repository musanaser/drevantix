export type LatLng = [number, number];

const R = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export interface Path {
  points: LatLng[];
  cumulative: number[];
  length: number;
}

export function buildPath(points: LatLng[]): Path {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + distanceM(points[i - 1], points[i]));
  return { points, cumulative, length: cumulative[cumulative.length - 1] };
}

export function pointAt(path: Path, d: number): { pos: LatLng; heading: number } {
  const { points, cumulative } = path;
  if (d <= 0) return { pos: points[0], heading: bearing(points[0], points[1] ?? points[0]) };
  if (d >= path.length) {
    const n = points.length;
    return { pos: points[n - 1], heading: bearing(points[n - 2] ?? points[n - 1], points[n - 1]) };
  }
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] <= d) lo = mid;
    else hi = mid;
  }
  const seg = cumulative[hi] - cumulative[lo] || 1;
  const t = (d - cumulative[lo]) / seg;
  const a = points[lo];
  const b = points[hi];
  return { pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], heading: bearing(a, b) };
}
