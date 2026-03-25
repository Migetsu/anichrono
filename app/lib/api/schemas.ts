import { z } from 'zod'

// Shared schemas
export const PosterSchema = z.object({
  mainUrl: z.string().optional().nullable(),
  originalUrl: z.string().optional().nullable(),
  previewUrl: z.string().optional().nullable(),
}).optional().nullable()

export const GenreSchema = z.object({
  id: z.string(),
  name: z.string(),
  russian: z.string().optional().nullable(),
})

// Anime List Item (Catalog, Home, Search)
export const ShikimoriAnimeListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  russian: z.string().optional().nullable(),
  score: z.number().optional().nullable(),
  kind: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  poster: PosterSchema,
  genres: z.array(GenreSchema).optional().nullable(),
  airedOn: z.object({
    year: z.number().optional().nullable(),
  }).optional().nullable(),
})

export const AnimesQueryResponseSchema = z.object({
  animes: z.array(ShikimoriAnimeListItemSchema),
})

// Detailed Anime Info
export const ShikimoriAnimeDetailSchema = ShikimoriAnimeListItemSchema.extend({
  description: z.string().optional().nullable(),
  descriptionHtml: z.string().optional().nullable(),
  episodes: z.number().optional().nullable(),
  episodesAired: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  rating: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  screenshots: z.array(z.object({
    originalUrl: z.string(),
    previewUrl: z.string(),
  })).optional(),
  videos: z.array(z.object({
    url: z.string(),
    name: z.string().optional(),
  })).optional(),
})
