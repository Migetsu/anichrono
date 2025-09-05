import { shikiGQL } from './shikiClient';

// поля, которые нам нужны
const FIELDS = `
  id
  name
  russian
  description
  score
  status
  episodes
  poster { originalUrl }
  genres { id name russian }
  studios { id name }
`;

// 2 возможные формы аргументов, которые встречаются в разных версиях схемы
const Q_ID_IN = `query ($ids: [ID!]!) { animes(id_in: $ids) { ${FIELDS} } }`;
const Q_IDS_STRING = `query ($ids: String!) { animes(ids: $ids) { ${FIELDS} } }`;

/** Пытаемся привести routeId к числу (если это base64-GlobalID — декодируем) */
function normalizeNumeric(routeId) {
  const s = String(routeId);
  if (/^\d+$/.test(s)) return s;                 // уже число
  try {
    const dec = atob(s);                         // "Anime:123"
    const m = dec.match(/\d+/);
    if (m) return m[0];
  } catch (_) {}
  const onlyDigits = s.replace(/\D+/g, '');      // достаём цифры как fallback
  return onlyDigits || null;
}

/**
 * Универсальный запрос аниме по routeId
 * - пробует id_in: [ID!]!
 * - затем ids: String! со строкой "[123]"
 * - затем ids: String! со строкой '["RAW"]'
 * Возвращает { anime, strategy }
 */
export async function fetchAnimeById(routeId) {
  // 1) сначала пробуем числовой id (если смогли извлечь)
  const num = normalizeNumeric(routeId);

  // A. animes(id_in: [ID!]!)
  if (num) {
    try {
      const data = await shikiGQL(Q_ID_IN, { ids: [num] });
      if (data?.animes?.length) return { anime: data.animes[0], strategy: 'id_in:[num]' };
    } catch (_) {}
  }

  // B. animes(ids: "[123]") — схема, где ids это String
  if (num) {
    try {
      const data = await shikiGQL(Q_IDS_STRING, { ids: `[${num}]` });
      if (data?.animes?.length) return { anime: data.animes[0], strategy: 'ids:"[num]"' };
    } catch (_) {}
  }

  // C. animes(ids: '["RAW"]') — если backend ждёт строковый массив с GlobalID
  try {
    const data = await shikiGQL(Q_IDS_STRING, { ids: `["${String(routeId)}"]` });
    if (data?.animes?.length) return { anime: data.animes[0], strategy: 'ids:["raw"]' };
  } catch (_) {}

  throw new Error('Тайтл не найден по переданному id');
}
