# OKAPI test scripts

Node.js (ESM) scripts for testing OKAPI services manually.

## Setup

```bash
cp config.example.js config.js
# edit config.js — fill in your consumer key, secrets, and target baseUrl
```

`config.js` is gitignored. Never commit it.

## Regression suite (read-only)

`run.mjs` runs a set of checks and reports pass/fail with an exit code
(0 = all passed, 1 = a check failed, 2 = setup error). It only reads, so it is
safe against any installation, including production.

```bash
node run.mjs                              # the default target (baseUrl etc. above)
node run.mjs --target prod                # a named target from `targets` in config.js
node run.mjs --expect-revision 3b41888    # also check the deployed okapi_git_revision
```

The output starts with the full responses of `apisrv/installation` (what the
installation can do) and `logs/capabilities` (what the user may log on the test
cache), so every run documents what it ran against.

What it checks:
- level 0: `apisrv/installation` (fields, `has_*` flags, optionally the revision);
  error format for a missing consumer key
- level 1: unknown consumer key rejected; `caches/search/all`, `caches/geocache`, `logs/logs`
- level 3: `users/user` signed with PLAINTEXT and with HMAC-SHA1 (both must work and
  return the same user); HMAC with parameters that need percent-encoding; a wrong
  secret is rejected; `logs/capabilities`; `my_coords` when `has_user_coords` is set

Levels whose credentials a target lacks are skipped, not failed. Credentials are
per installation: get a consumer key from the installation's `okapi/signup.html`
and an access token for your test user.

## Finding a valid cache code

```bash
node oc-search.mjs <username>    # prints OC codes of caches owned by <username>
```

## Running tests

All scripts accept the cache code as a CLI argument. For tests that require
a valid code in the target database, use one from `oc-search.mjs`.

```bash
# Verify installation (no cache code needed)
node oc-installation.mjs

# Public endpoints
node oc-get-logs.mjs OC1234

# OAuth endpoints
node oc-get-cache.mjs OC1234
node oc-log-capabilities.mjs OC1234

# Services added in this fork
node oc-save-user-coords.mjs OC1234 48.123456 9.123456
node oc-lists.mjs OC1234
node oc-fieldnotes.mjs OC1234
```

## Cache CRUD (writes to the target database)

Run as the owner of the caches. Creates, moves and archives 36 test caches named `Nut-01` … `Nut-36`.

```bash
node oc-create-circle.mjs       # caches/create: 36 caches in a circle
node oc-update-circle-fix.mjs   # caches/update: correct the even ones to a true circle
node oc-delete-odd-nuts.mjs     # caches/delete: archive the odd ones
node oc-cleanup-circle.mjs      # archive all remaining Nut-XX caches
```

## Switching installations

Edit `baseUrl` in `config.js` (and use credentials issued by that installation):
```js
export const baseUrl = 'https://okapi.example.org';
```
