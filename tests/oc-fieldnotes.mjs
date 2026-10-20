// Tests services/draftlogs/upload_fieldnotes (requires OAuth)
//
// Usage:
//   node oc-fieldnotes.mjs --file sample_fieldnotes.txt   load from file
//   node oc-fieldnotes.mjs OC17C1C                        inline single "Found it"
import { okapiPost } from './oauth.mjs';
import { readFileSync } from 'node:fs';

let fieldNotes;
let expectedTotal;

if (process.argv[2] === '--file') {
  const path = process.argv[3];
  if (!path) { console.error('Usage: node oc-fieldnotes.mjs --file <path>'); process.exit(1); }
  fieldNotes = readFileSync(path, 'utf8');
  expectedTotal = fieldNotes.trim().split('\n').length;
} else {
  const cache_code = process.argv[2];
  if (!cache_code) { console.error('Usage: node oc-fieldnotes.mjs <cache_code>  OR  --file <path>'); process.exit(1); }
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  fieldNotes = `${cache_code},${date},Found it,"Test draft log from okapi test suite"`;
  expectedTotal = 1;
}

const result = await okapiPost('services/draftlogs/upload_fieldnotes', { field_notes: fieldNotes });
console.log(JSON.stringify(result, null, 2));

if (result.error) { console.error('✗ upload failed'); process.exit(1); }
if (result.success !== true) { console.error('✗ success !== true'); process.exit(1); }
console.log(`✓ processed ${result.processed_records}/${result.total_records} records`);
if (result.total_records !== expectedTotal) {
  console.log(`  (note: ${expectedTotal - result.total_records} record(s) skipped — likely non-OC platform entries)`);
}
