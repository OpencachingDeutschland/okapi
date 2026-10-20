// Archives all Nut-XX caches created by oc-create-circle.mjs
// Usage: node oc-cleanup-circle.mjs
import { okapiPost, okapiGet } from './oauth.mjs';

// Bounding box around the circle (center N52.327366 E9.543, with margin)
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

// caches/archive takes OC codes, so look up which codes are the Nut caches
const details = await okapiGet('services/caches/geocaches', {
    cache_codes: codes.join('|'),
    fields: 'code|name',
});

const nuts = Object.values(details)
    .filter(c => c && /^Nut-(\d+)$/.test(c.name))
    .sort((a, b) => parseInt(a.name.split('-')[1]) - parseInt(b.name.split('-')[1]));

console.log(`Archiving ${nuts.length} circle caches...`);

let deleted = 0;
let failed = 0;

for (const cache of nuts) {
    const result = await okapiPost('services/caches/archive', {
        cache_code: cache.code,
    });
    if (result.success) {
        console.log(`✓ ${cache.name} (${cache.code}) archived`);
        deleted++;
    } else {
        console.log(`✗ ${cache.name} (${cache.code}): ${result.error?.developer_message || JSON.stringify(result)}`);
        failed++;
    }
}

console.log(`\nArchived: ${deleted}, Failed: ${failed}`);
