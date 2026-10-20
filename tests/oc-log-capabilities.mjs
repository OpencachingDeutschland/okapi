// Tests services/logs/capabilities (requires OAuth)
import { okapiPost } from './oauth.mjs';

const cache_code = process.argv[2] ?? 'OC17C1C';

const result = await okapiPost('services/logs/capabilities', {
  cache_code,
  fields: 'submittable_logtypes|reasons_whynot|can_rate|can_recommend|password_required',
});
console.log(JSON.stringify(result, null, 2));
