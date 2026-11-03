// Fetches road-following loop routes around Riyadh from the public OSRM demo server
// and writes them to src/data/routes.json for the GPS simulator.
import { writeFileSync } from 'node:fs';

const P = {
  kingdomCentre: [24.7114, 46.6744, 'Kingdom Centre'],
  faisaliah: [24.6903, 46.6853, 'Al Faisaliah'],
  kafd: [24.7661, 46.64, 'KAFD'],
  airport: [24.9576, 46.6988, 'King Khalid Airport'],
  riyadhPark: [24.7556, 46.6297, 'Riyadh Park'],
  dirah: [24.6315, 46.7133, 'Al Dirah'],
  dq: [24.6806, 46.6236, 'Diplomatic Quarter'],
  industrial2: [24.5530, 46.8600, '2nd Industrial City'],
  ksu: [24.7163, 46.6191, 'King Saud University'],
  granada: [24.781, 46.727, 'Granada'],
  nakheel: [24.769, 46.7112, 'Al Nakheel'],
  dryPort: [24.6632, 46.751, 'Riyadh Dry Port'],
  malaz: [24.665, 46.733, 'Al Malaz'],
  pnu: [24.8466, 46.7246, 'Princess Nourah University'],
  qirawan: [24.835, 46.595, 'Al Qirawan'],
  rawdah: [24.738, 46.769, 'Al Rawdah'],
  sulay: [24.585, 46.815, 'Al Sulay'],
  olaya: [24.695, 46.684, 'Olaya'],
  yarmouk: [24.807, 46.776, 'Al Yarmouk'],
  shifa: [24.56, 46.70, 'Al Shifa'],
};

const loops = [
  ['kingdomCentre', 'kafd', 'riyadhPark', 'ksu'],
  ['dryPort', 'industrial2', 'sulay', 'malaz'],
  ['airport', 'pnu', 'granada', 'nakheel'],
  ['faisaliah', 'dirah', 'malaz', 'olaya'],
  ['dq', 'ksu', 'qirawan', 'riyadhPark'],
  ['rawdah', 'yarmouk', 'granada', 'nakheel'],
  ['sulay', 'shifa', 'dirah', 'dryPort'],
  ['olaya', 'kafd', 'pnu', 'airport'],
  ['malaz', 'rawdah', 'yarmouk', 'kingdomCentre'],
  ['industrial2', 'dryPort', 'faisaliah', 'shifa'],
  ['qirawan', 'kafd', 'nakheel', 'olaya'],
  ['ksu', 'dq', 'dirah', 'faisaliah'],
];

const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
function dist(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const routes = [];
for (const [i, loop] of loops.entries()) {
  const legs = [];
  for (let j = 0; j < loop.length; j++) {
    const a = P[loop[j]];
    const b = P[loop[(j + 1) % loop.length]];
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok') throw new Error(`OSRM error for ${url}: ${json.code}`);
    const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [+lat.toFixed(6), +lng.toFixed(6)]);
    const simplified = [coords[0]];
    for (const c of coords.slice(1, -1)) if (dist(simplified.at(-1), c) > 25) simplified.push(c);
    simplified.push(coords.at(-1));
    legs.push({ from: a[2], to: b[2], points: simplified });
    await sleep(300);
  }
  routes.push({ id: i + 1, name: loop.map((k) => P[k][2]).join(' → '), legs });
  console.log(`route ${i + 1}: ${legs.map((l) => l.points.length).join('+')} points`);
}
writeFileSync(new URL('../src/data/routes.json', import.meta.url), JSON.stringify(routes));
