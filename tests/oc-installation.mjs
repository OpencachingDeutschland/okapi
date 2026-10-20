// Tests services/apisrv/installation
// Verifies the test instance is correctly configured and our new services are registered.
import { okapiPublicGet } from './oauth.mjs';

const result = await okapiPublicGet('services/apisrv/installation');

if (result.error) {
  console.error('FAIL', result.error);
  process.exit(1);
}

const checks = {
  'has_draft_logs': result.has_draft_logs === true,
  'has_lists':      result.has_lists === true,
  'site_name':      typeof result.site_name === 'string',
  'okapi_base_url': typeof result.okapi_base_url === 'string',
};

let pass = true;
for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? '✓' : '✗'} ${name}: ${JSON.stringify(result[name] ?? null)}`);
  if (!ok) pass = false;
}

if (!pass) process.exit(1);
