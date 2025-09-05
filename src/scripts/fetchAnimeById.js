import { shikiGQL } from './shikiClient';

const QUERY = `
  query ($id: ID!) {
    animes(ids: [$id]) {
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
  const data = await shikiGQL(QUERY, { id: Number(id) });
  const anime = data?.animes?.[0];
  if (!anime) throw new Error('Тайтл не найден по переданному id');
  return anime;
}