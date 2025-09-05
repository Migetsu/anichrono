import { shikiGQL } from './shikiClient';

const QUERY = `
  query ($ids: [ID!]!) {
    animes(ids: $ids) {
      id
      name
      russian
      description
      score
      kind
      rating
      status
      duration
      episodes
      episodesAired
      airedOn
      releasedOn
      poster { originalUrl }
      genres { id name russian }
      studios { id name }
    }
  }
`;

export async function fetchAnimeById(id) {
  const data = await shikiGQL(QUERY, { ids: [Number(id)] });
  const [anime] = data?.animes ?? [];
  if (!anime) throw new Error('Тайтл не найден по переданному id');
  return anime;
}