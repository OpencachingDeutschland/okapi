// Tests services/caches/geocache
import { okapiPost } from './oauth.mjs';

const cache_code = process.argv[2] ?? 'OC183E3';

const fields = [
  'code', 'name', 'location', 'type', 'status', 'needs_maintenance',
  'url', 'owner', 'founds', 'notfounds', 'size2', 'difficulty', 'terrain',
  'short_description', 'description', 'hint2', 'attr_acodes', 'attrnames',
  'latest_logs', 'last_found', 'date_created', 'date_hidden', 'internal_id',
].join('|');

const result = await okapiPost('services/caches/geocache', { cache_code, fields, lpc: 5 });
console.log(JSON.stringify(result, null, 2));
