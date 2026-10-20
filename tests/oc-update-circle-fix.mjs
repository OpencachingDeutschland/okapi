// Fixes the 18 remaining even-numbered Nut caches from an ellipse to a true circle.
// At 52.327366°N, a degree of longitude is shorter than a degree of latitude by
// a factor of cos(lat) ≈ 0.609. We correct the longitude radius by 1/cos(lat) ≈ 1.642.
// Usage: node oc-update-circle-fix.mjs
import { okapiPost, okapiGet } from './oauth.mjs';

const CENTER_LAT  = 52.327366;
const CENTER_LON  = 9.543;
const LAT_RADIUS  = 0.035;                                      // unchanged
const LON_RADIUS  = LAT_RADIUS / Math.cos(CENTER_LAT * Math.PI / 180); // ≈ 0.05747

console.log(`Circle correction at N${CENTER_LAT}`);
console.log(`  lat radius: ${LAT_RADIUS.toFixed(5)}°`);
console.log(`  lon radius: ${LON_RADIUS.toFixed(5)}°  (correction factor: ${(LON_RADIUS/LAT_RADIUS).toFixed(4)})`);
console.log('');

// Find all remaining Nut caches
const search = await okapiGet('services/caches/search/bbox', {
    bbox: '52.24|9.45|52.42|9.64',
    limit: 500,
    status: 'Available',
});

if (search.error) {
    console.error('Search failed:', JSON.stringify(search.error));
    process.exit(1);
}

const details = await okapiGet('services/caches/geocaches', {
    cache_codes: search.results.join('|'),
    fields: 'code|name|location',
});

// Only even-numbered Nut caches, sorted by number
const nuts = Object.values(details)
    .filter(c => c && /^Nut-(\d+)$/.test(c.name))
    .sort((a, b) => parseInt(a.name.split('-')[1]) - parseInt(b.name.split('-')[1]));

console.log(`Found ${nuts.length} Nut caches to update.\n`);

let updated = 0;
let failed  = 0;

for (const cache of nuts) {
    const num   = parseInt(cache.name.split('-')[1]);
    const angle = ((num - 1) * 360 / 36) * (Math.PI / 180); // original angle

    const newLat = CENTER_LAT + LAT_RADIUS * Math.sin(angle);
    const newLon = CENTER_LON + LON_RADIUS * Math.cos(angle);

    const [oldLat, oldLon] = cache.location.split('|').map(Number);

    const result = await okapiPost('services/caches/update', {
        cache_code: cache.code,
        latitude:   newLat.toFixed(6),
        longitude:  newLon.toFixed(6),
    });

    if (result.success) {
        updated++;
        console.log(`✓ ${cache.name} (${cache.code})  ${oldLat.toFixed(6)}|${oldLon.toFixed(6)}  →  ${newLat.toFixed(6)}|${newLon.toFixed(6)}`);
    } else {
        failed++;
        console.error(`✗ ${cache.name} (${cache.code}):`, JSON.stringify(result));
    }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Result: ${updated} updated, ${failed} failed`);
if (updated > 0)
    console.log(`The remaining ${updated} Nut caches now form a true circle on the map.`);

process.exit(failed > 0 ? 1 : 0);
