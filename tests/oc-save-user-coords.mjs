// Tests services/caches/save_user_coords and the my_coords field (requires OAuth)
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
  const c = await okapiGet('services/caches/geocache', { cache_code, fields: 'my_coords|alt_wpts' });
  const wpt = (c.alt_wpts ?? []).find(w => w.type === 'user-coords');
  return { my_coords: c.my_coords, wpt_location: wpt ? wpt.location : null, raw: c };
}

const inst = await okapiGet('services/apisrv/installation');
check('installation.has_user_coords is true', inst.has_user_coords === true, inst);

// set
const expected = `${Number(lat)}|${Number(lon)}`;
let r = await okapiPost('services/caches/save_user_coords', { cache_code, user_coords: `${lat}|${lon}` });
check('set: success', r.success === true, r);
check('set: response my_coords', r.my_coords === expected, r);
let b = await readBack();
check('set: geocache.my_coords', b.my_coords === expected, b.raw);
check('set: alt_wpts user-coords', b.wpt_location === expected, b.raw);

// 0|0 is rejected
r = await okapiPost('services/caches/save_user_coords', { cache_code, user_coords: '0|0' });
check('0|0 is rejected', r.error?.status === 400, r);

// remove
r = await okapiPost('services/caches/save_user_coords', { cache_code, user_coords: '' });
check('remove: success', r.success === true, r);
check('remove: response my_coords is null', r.my_coords === null, r);
b = await readBack();
check('remove: geocache.my_coords is null', b.my_coords === null, b.raw);
check('remove: no alt_wpts user-coords', b.wpt_location === null, b.raw);

// removing the coordinates keeps the personal note (oc.de stores both in one row)
const note = 'okapi-test note ' + Date.now();
r = await okapiPost('services/caches/save_personal_notes', { cache_code, new_value: note });
check('note: saved', r.replaced === true, r);
await okapiPost('services/caches/save_user_coords', { cache_code, user_coords: `${lat}|${lon}` });
await okapiPost('services/caches/save_user_coords', { cache_code, user_coords: '' });
let c = await okapiGet('services/caches/geocache', { cache_code, fields: 'my_notes|my_coords' });
check('note: kept after removing coords', c.my_notes === note && c.my_coords === null, c);
r = await okapiPost('services/caches/save_personal_notes', { cache_code, new_value: '', old_value: note });
c = await okapiGet('services/caches/geocache', { cache_code, fields: 'my_notes|my_coords' });
check('note: cleaned up', c.my_notes === null && c.my_coords === null, c);

// missing parameter
r = await okapiPost('services/caches/save_user_coords', { cache_code });
check('missing user_coords is rejected', r.error?.status === 400, r);

console.log(failures ? `\n${failures} failure(s)` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
