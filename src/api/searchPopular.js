import { shikiGQL } from "@/api/shikiClient.js";

const QUERY = `
  query ($limit: Int) {
    animes(order: popularity, limit: $limit) {
      id
      name
      russian
      score
      poster { originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`;

export async function searchPopular(limit) {
  const data = await shikiGQL(QUERY, { limit });
  return data?.animes ?? [];
}