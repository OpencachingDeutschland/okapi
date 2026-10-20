// Creates 36 caches arranged in a circle for testing
// Usage: node oc-create-circle.mjs
import { okapiPost } from './oauth.mjs';

const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

// Circle parameters
const CENTER_LAT = 52.327366;  // N52 19.642
const CENTER_LON = 9.543;      // E009 32.580
const RADIUS_DEGREES = 0.035;  // ~3.5 km radius at this latitude
const NUM_CACHES = 36;

// Generate cache coordinates
function generateCircleCoordinates() {
  const caches = [];
  for (let i = 0; i < NUM_CACHES; i++) {
    const angle = (i * 360 / NUM_CACHES) * (Math.PI / 180); // convert to radians
    const lat = CENTER_LAT + RADIUS_DEGREES * Math.sin(angle);
    const lon = CENTER_LON + RADIUS_DEGREES * Math.cos(angle);
    caches.push({
      number: String(i + 1).padStart(2, '0'),
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
      angle: (i * 360 / NUM_CACHES).toFixed(0),
    });
  }
  return caches;
}

const caches = generateCircleCoordinates();

console.log(`Creating ${NUM_CACHES} caches in a circle around N${CENTER_LAT.toFixed(6)} E${CENTER_LON.toFixed(6)}`);
console.log(`Radius: ${RADIUS_DEGREES}° (approximately 3-4 km)\n`);

let created = 0;
let failed = 0;
const results = [];

for (const cache of caches) {
  const result = await okapiPost('services/caches/create', {
    cache_name: `Nut-${cache.number}`,
    cache_type: 'Quiz',
    latitude: cache.latitude,
    longitude: cache.longitude,
    difficulty: '2.5',
    terrain: '2.0',
    size2: 'micro',
    short_description: `Mystery cache #${cache.number}`,
    description: LOREM_IPSUM,
    hint2: 'Look carefully around the coords.',
  });

  if (result.cache_code) {
    created++;
    console.log(`✓ Nut-${cache.number} (${cache.angle}°) → ${result.cache_code} at ${cache.latitude}|${cache.longitude}`);
    results.push({
      code: result.cache_code,
      name: `Nut-${cache.number}`,
      lat: cache.latitude,
      lon: cache.longitude,
      angle: cache.angle,
      url: result.url,
    });
  } else {
    failed++;
    console.error(`✗ Nut-${cache.number}: ${JSON.stringify(result)}`);
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Result: ${created}/${NUM_CACHES} created, ${failed} failed`);

if (created > 0) {
  console.log(`\nCreated Cache Summary:`);
  console.log(`┌─────────┬──────────┬────────────────────┬──────────┬──────────┐`);
  console.log(`│ Cache   │ Code     │ Coordinates        │ Angle    │ Radius   │`);
  console.log(`├─────────┼──────────┼────────────────────┼──────────┼──────────┤`);
  for (const cache of results) {
    console.log(`│ ${cache.name} │ ${cache.code} │ ${cache.lat}|${cache.lon.padEnd(7)} │ ${String(cache.angle).padStart(3)}°   │ ${RADIUS_DEGREES}° │`);
  }
  console.log(`└─────────┴──────────┴────────────────────┴──────────┴──────────┘`);
  console.log(`\nAll caches should form a circle on the map centered at:`);
  console.log(`N${CENTER_LAT} E${CENTER_LON}`);
}

process.exit(failed > 0 ? 1 : 0);
