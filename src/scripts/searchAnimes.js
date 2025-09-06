import axios from "axios";

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
  const { data } = await axios.post("/shiki/api/graphql", {
    query: QUERY,
    variables: { search: title, limit },
  });
  if (data.errors) throw new Error(data.errors[0]?.message || "GraphQL error");
  return data.data?.animes ?? [];
}
