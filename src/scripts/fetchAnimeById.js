import { shikiGQL } from './shikiClient';

const QUERY = `
  query ($ids: String!) {
    animes(ids: $ids) {
      id
      name
      russian
      description
      descriptionHtml
      score
      kind
      rating
      status
      duration
      episodes
      episodesAired
      airedOn { year month day date }
      releasedOn { year month day date }
      poster { originalUrl }
      videos { url playerUrl }
      genres { id name russian }
      studios { id name }
    }
  }
`;

export async function fetchAnimeById(id) {
  const ids = String(id);             // 👈 ровно "1535", без скобок и без JSON
  const data = await shikiGQL(QUERY, { ids });
  const anime = data?.animes?.[0];
  if (!anime) throw new Error('Тайтл не найден по переданному id');
  return anime;
}
