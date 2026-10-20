// Searches OKAPI for geocaches and prints their OC codes.
// Use the results as arguments to the other test scripts.
// Usage: node oc-search.mjs <username>   — lists caches owned by that user
import { okapiPublicGet, okapiPost } from './oauth.mjs';

const owner_username = process.argv[2];
if (!owner_username) {
  console.error('Usage: node oc-search.mjs <username>');
  process.exit(1);
}

// Step 1: resolve username → UUID
const user = await okapiPublicGet('services/users/by_username', {
  username: owner_username,
  fields: 'uuid|username|caches_found',
});
if (user.error) {
  console.error(`User lookup failed for "${owner_username}":`, user.error.developer_message ?? user.error);
  process.exit(1);
}
console.error(`owner: ${user.username}  uuid: ${user.uuid}`);

// Step 2: search by owner_uuid
const search = await okapiPublicGet('services/caches/search/all', {
  owner_uuid: user.uuid,
  limit: 20,
  status: 'Available|Temporarily unavailable|Archived',
});
if (search.error) {
  console.error('Search failed:', search.error.developer_message ?? search.error);
  process.exit(1);
}
const codes = search.results;
if (!codes?.length) {
  console.log('No caches found.');
  process.exit(0);
}

// Step 3: fetch details
const details = await okapiPost('services/caches/geocaches', {
  cache_codes: codes.join('|'),
  fields: 'code|name|status|type',
});

for (const [code, cache] of Object.entries(details)) {
  if (cache.error) continue;
  console.log(`${code}  ${cache.status.padEnd(30)}  ${cache.type.padEnd(20)}  ${cache.name}`);
}
