import { shikiGQL } from "@/scripts/shikiClient.js";

const QUERY = `
  query ($search: String!, $limit: Int) {
    animes(search: $search, limit: $limit) {
      id
      name
      russian
    }
  }
`;

export async function searchAnimes(title, limit = 5) {
  const data = await shikiGQL(QUERY, { search: title, limit });
  return data?.animes ?? [];
}