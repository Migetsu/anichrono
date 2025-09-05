import { shikiGQL } from './shikiClient';

const QUERY = `
  query ($ids: [ID!]!) {
    animes(search: "bakemono") {
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
      airedOn {
      year
      month
      day
      date
        }
      releasedOn {
      year
      month
      day
      date
        }
      poster { originalUrl }
      genres { id name russian }
      studios { id name }
    }
  }
`;

export async function fetchAnimeById(id) {
  const data = await shikiGQL(QUERY, { ids: [String(id)] });
  const anime = data?.animes?.[0];
  if (!anime) throw new Error('Тайтл не найден по переданному id');
  return anime;
}
