// src/api/shikiClient.js
// лёгкая обёртка над GraphQL
const cache = new Map();
const TTL = 5 * 60 * 1000;
export async function shikiGQL(query, variables = {}) {
  const key = JSON.stringify({ query, variables });
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL) {
    return cached.data;
  }
  const res = await fetch('/shiki/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message || res.statusText || 'GraphQL error';
    throw new Error(msg);
  }
  cache.set(key, { data: json.data, time: Date.now() });
  return json.data;
}