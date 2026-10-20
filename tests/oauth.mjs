import { consumerKey, consumerSecret, accessToken, tokenSecret, baseUrl } from './config.js';

// Builds an OAuth 1.0a PLAINTEXT Authorization header.
export function oauthHeader() {
  const sig = encodeURIComponent(consumerSecret) + '%26' + encodeURIComponent(tokenSecret);
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return `OAuth oauth_consumer_key="${consumerKey}", oauth_token="${accessToken}", oauth_signature_method="PLAINTEXT", oauth_signature="${sig}", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0"`;
}

export { consumerKey, baseUrl };

// Convenience wrapper: fetch an OKAPI endpoint with OAuth.
export async function okapiGet(path, params = {}) {
  const url = new URL(`${baseUrl}/okapi/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: oauthHeader(), 'User-Agent': 'okapi-test-suite/1.0' },
  });
  return res.json();
}

export async function okapiPost(path, body = {}) {
  const res = await fetch(`${baseUrl}/okapi/${path}`, {
    method: 'POST',
    headers: {
      Authorization: oauthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'okapi-test-suite/1.0',
    },
    body: new URLSearchParams(body).toString(),
  });
  return res.json();
}

// Public (no OAuth) — consumer_key only.
export async function okapiPublicGet(path, params = {}) {
  const url = new URL(`${baseUrl}/okapi/${path}`);
  url.searchParams.set('consumer_key', consumerKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'User-Agent': 'okapi-test-suite/1.0' } });
  return res.json();
}
