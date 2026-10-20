// Tests services/caches/save_user_coords and the user_coords field (requires OAuth)
// Usage: node oc-save-user-coords.mjs <cache_code> [lat] [lon]
// The cache_code must exist in the target database. The user's coordinates
// for that cache are removed at the end.
import { okapiGet, okapiPost } from './oauth.mjs';

const cache_code  = process.argv[2];
const lat         = process.argv[3] ?? '48.123456';
const lon         = process.argv[4] ?? '9.123456';

if (!cache_code) {
  console.error('Usage: node oc-save-user-coords.mjs <cache_code> [lat] [lon]');
  process.exit(1);
}

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + JSON.stringify(detail)}`);
  if (!ok) failures++;
}

async function readBack() {
  const c = await okapiGet('services/caches/geocache', { cache_code, fields: 'user_coords|alt_wpts' });
  const wpt = (c.alt_wpts ?? []).find(w => w.type === 'user-coords');
  return { user_coords: c.user_coords, wpt_location: wpt ? wpt.location : null, raw: c };
}

const method = await okapiGet('services/apiref/method', { name: 'services/caches/save_user_coords' });
check('the installation has services/caches/save_user_coords', method.name === 'services/caches/save_user_coords', method);

// set
const expected = `${Number(lat)}|${Number(lon)}`;
let r = await okapiPost('services/caches/save_user_coords', { cache_code, new_value: `${lat}|${lon}` });
check('set: success', r.success === true, r);
check('set: response saved_value', r.saved_value === expected, r);
let b = await readBack();
check('set: geocache.user_coords', b.user_coords === expected, b.raw);
check('set: alt_wpts user-coords', b.wpt_location === expected, b.raw);

// 0|0 is rejected
r = await okapiPost('services/caches/save_user_coords', { cache_code, new_value: '0|0' });
check('0|0 is rejected', r.error?.status === 400, r);

// remove
r = await okapiPost('services/caches/save_user_coords', { cache_code, new_value: '' });
check('remove: success', r.success === true, r);
check('remove: response saved_value is null', r.saved_value === null, r);
b = await readBack();
check('remove: geocache.user_coords is null', b.user_coords === null, b.raw);
check('remove: no alt_wpts user-coords', b.wpt_location === null, b.raw);

// removing the coordinates keeps the personal note (oc.de stores both in one row)
const note = 'okapi-test note ' + Date.now();
r = await okapiPost('services/caches/save_personal_notes', { cache_code, new_value: note });
check('note: saved', r.replaced === true, r);
await okapiPost('services/caches/save_user_coords', { cache_code, new_value: `${lat}|${lon}` });
await okapiPost('services/caches/save_user_coords', { cache_code, new_value: '' });
let c = await okapiGet('services/caches/geocache', { cache_code, fields: 'my_notes|user_coords' });
check('note: kept after removing coords', c.my_notes === note && c.user_coords === null, c);
r = await okapiPost('services/caches/save_personal_notes', { cache_code, new_value: '', old_value: note });
c = await okapiGet('services/caches/geocache', { cache_code, fields: 'my_notes|user_coords' });
check('note: cleaned up', c.my_notes === null && c.user_coords === null, c);

// missing parameter
r = await okapiPost('services/caches/save_user_coords', { cache_code });
check('missing new_value is rejected', r.error?.status === 400, r);

console.log(failures ? `\n${failures} failure(s)` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
