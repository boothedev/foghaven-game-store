import { z } from 'zod';
import { centsToDollars, dateToFormat } from '@/lib/utils';

export const genreSchema = z.object({
  id: z.int(),
  name: z.string().nonempty(),
  icon: z.string().nullable(),
});

export const genreListSchema = z.array(genreSchema);

export const platformSchema = z.object({
  id: z.int(),
  name: z.string().nonempty(),
  value: z.string().nonempty(),
});

export const platformListSchema = z.array(platformSchema);

export const achievementSchema = z.object({
  name: z.string(),
  thumbnail: z.string(),
});

export const screenshotSchema = z.object({
  thumbnail: z.string(),
  content: z.string(),
});

export const movieSchema = z.object({
  thumbnail: z.string(),
  content_sd: z.string(),
  content_max: z.string(),
});

export const extendedPlatformSchema = platformSchema.safeExtend({
  min_requirements: z.string().nullable(),
  rec_requirements: z.string().nullable(),
});

export const baseGameSchema = z.object({
  id: z.int(),
  name: z.string(),
  price: z.int().positive().transform(centsToDollars),
  introduction: z.string(),
  landscape: z.url(),
  release_date: z.coerce.date().transform(dateToFormat),
  rating: z.number().positive().lte(5),
});

export const gameListItemSchema = baseGameSchema.extend({
  genre_ids: z.array(z.int()),
  platform_ids: z.array(z.int()),
});

export const gameListSchema = z.array(gameListItemSchema);

export const gameSchema = baseGameSchema.safeExtend({
  description: z.string(),
  developer: z.string(),
  publisher: z.string(),
  portrait: z.string(),
  landscape: z.string(),
  rater_count: z.int(),
  platforms: z.array(extendedPlatformSchema),
  screenshots: z.array(screenshotSchema),
  movies: z.array(movieSchema),
  achievements: z.array(achievementSchema),
  user_stars: z.int().nullable(),
});

const cardSchema = z.object({
  id: z.int(),
  number: z.string(),
  exp_month: z.int().positive(),
  exp_year: z.int().positive(),
});

export const userSchema = z.object({
  username: z.string(),
  balance: z.int().nonnegative(),
  cards: z.array(cardSchema),
});

const searchParamIntArraySchema = z.array(z.int().positive())
  .or(z.int().positive().transform((arg) => [arg]))

export const gameFiltersSchema = z.object({
  page: z.int().positive().default(1),
  size: z.int().positive().lte(100).default(100),
  genres: searchParamIntArraySchema.optional(),
  platforms: searchParamIntArraySchema.optional(),
  sort: z.enum(['rating', 'rater_count']).default('rater_count'),
  order: z.enum(['asc', 'desc']).default('desc'),
  owned: z.boolean().optional(),
});