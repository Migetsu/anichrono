// src/api/shikiClient.js
// лёгкая обёртка над GraphQL
export async function shikiGQL(query, variables = {}) {
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
  return json.data;
}

