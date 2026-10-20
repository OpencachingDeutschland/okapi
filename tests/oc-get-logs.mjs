// Tests services/logs/logs (public endpoint)
import { baseUrl, consumerKey } from './oauth.mjs';

const cache_code = process.argv[2] ?? 'OC18CF0';
const fields = 'uuid|date|user|cache_code|type|comment|was_recommended|needs_maintenance2';

const res = await fetch(`${baseUrl}/okapi/services/logs/logs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'okapi-test-suite/1.0' },
  body: new URLSearchParams({ consumer_key: consumerKey, cache_code, fields, user_fields: 'uuid|username' }).toString(),
});
const result = await res.json();
console.log(JSON.stringify(result, null, 2));
