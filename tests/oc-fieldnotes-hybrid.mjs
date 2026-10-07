// Tests services/draftlogs/upload_fieldnotes with a hybrid field notes file (requires OAuth)
// as cgeo and Garmin devices write it: UTF-16LE without BOM, geocaching.com log type
// names, records of several platforms mixed.
// Usage: node oc-fieldnotes-hybrid.mjs <oc_cache_code>
// The uploaded records end up as draft logs of the test user; delete them on the
// website (field notes page) or in the DB afterwards.
import { okapiPost } from './oauth.mjs';

const oc = process.argv[2];
if (!oc) {
  console.error('Usage: node oc-fieldnotes-hybrid.mjs <oc_cache_code>');
  process.exit(1);
}

const records = [
  ['GC12345', 'Found it', 'TFTC', false],                          // other platform
  [oc, 'Found it', 'Grüße aus Köln, Straße ß', true],
  [oc, 'Write note', "Zeile 1\nZeile 2 mit 'Zitat' <3", true],     // GC name for Comment
  [oc, 'needs maintenance', 'Logbuch voll', true],                 // case-insensitive
  [oc, 'Will Attend', 'no draft type for this', false],            // not a draft type
  ['OP1234', 'Found it', 'Dzięki', false],                         // other platform
];
const content = records
  .map(([code, type, text], i) => `${code},2024-05-01T10:2${i}:00Z,${type},"${text}"`)
  .join('\n') + '\n';

const r = await okapiPost('services/draftlogs/upload_fieldnotes', {
  field_notes: Buffer.from(content, 'utf16le').toString('base64'),
});
console.log(JSON.stringify(r));

const expected = records.filter(rec => rec[3]).length;
let failures = 0;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}
check('success', r.success === true);
check(`total_records = ${records.length}`, r.total_records === records.length);
check(`processed_records = ${expected} (OC records with a draft type)`, r.processed_records === expected);

console.log(failures ? `\n${failures} failure(s)` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
