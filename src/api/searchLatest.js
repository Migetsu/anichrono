import { shikiGQL } from "@/api/shikiClient.js";

const QUERY = `
  query ($limit: Int, $status: AnimeStatusString) {
    animes(status: $status, order: popularity, limit: $limit) {
      id
      name
      russian
      score
      poster { originalUrl }
      genres { id name russian }
    }
  }
`;

export async function searchLatest(limit, status) {
  const data = await shikiGQL(QUERY, { limit, status });
  return data?.animes ?? [];
}