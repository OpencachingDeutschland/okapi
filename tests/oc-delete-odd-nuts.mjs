// Deletes every odd-numbered Nut cache (Nut-01, Nut-03, ... Nut-35)
// Usage: node oc-delete-odd-nuts.mjs
import { okapiPost, okapiGet } from './oauth.mjs';

// Bounding box around the circle (center N52.327366 E9.543, radius ~0.05 deg margin)
const search = await okapiGet('services/caches/search/bbox', {
    bbox: '52.24|9.45|52.42|9.64',
    limit: 500,
});

if (search.error) {
    console.error('Search failed:', JSON.stringify(search.error));
    process.exit(1);
}

const codes = search.results;
if (!codes || codes.length === 0) {
    console.log('No caches found in bbox.');
    process.exit(0);
}

// Fetch names for all found caches
const details = await okapiGet('services/caches/geocaches', {
    cache_codes: codes.join('|'),
    fields: 'code|name',
});

// Filter odd-numbered Nut caches: Nut-01, Nut-03, Nut-05, ...
const oddNuts = Object.values(details)
    .filter(c => c && /^Nut-(\d+)$/.test(c.name) && parseInt(c.name.split('-')[1]) % 2 === 1)
    .sort((a, b) => parseInt(a.name.split('-')[1]) - parseInt(b.name.split('-')[1]));

const allNuts = Object.values(details)
    .filter(c => c && /^Nut-(\d+)$/.test(c.name));

console.log(`Found ${allNuts.length} Nut caches in bbox, ${oddNuts.length} are odd-numbered.\n`);

if (oddNuts.length === 0) {
    console.log('Nothing to delete.');
    process.exit(0);
}

let deleted = 0;
let failed = 0;

for (const cache of oddNuts) {
    const result = await okapiPost('services/caches/archive', {
        cache_code: cache.code,
    });

    if (result.success) {
        console.log(`✓ Deleted ${cache.name} (${cache.code})`);
        deleted++;
    } else {
        console.error(`✗ Failed ${cache.name} (${cache.code}):`, JSON.stringify(result));
        failed++;
    }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Result: ${deleted} deleted, ${failed} failed`);
console.log(`Remaining Nut caches: ${allNuts.length - deleted}`);

process.exit(failed > 0 ? 1 : 0);
