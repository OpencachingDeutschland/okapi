// Copy to config.js (gitignored) and fill in an OKAPI consumer and an access token
// issued for your test user on the target installation.
export const consumerKey    = 'YOUR_CONSUMER_KEY';
export const consumerSecret = 'YOUR_CONSUMER_SECRET';
export const accessToken    = 'YOUR_ACCESS_TOKEN';
export const tokenSecret    = 'YOUR_TOKEN_SECRET';
export const baseUrl        = 'https://okapi.example.org';

// Optional named targets for run.mjs (`node run.mjs --target prod`). Each needs its own
// credentials, issued by that installation. Leave fields empty to skip the levels that
// need them (no consumerKey: only level 0; no access token: no level 3).
export const targets = {
  prod: {
    baseUrl:        'https://www.opencaching.de',
    consumerKey:    '',
    consumerSecret: '',
    accessToken:    '',
    tokenSecret:    '',
  },
};
