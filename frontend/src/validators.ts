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
  contentSd: z.string(),
  contentMax: z.string(),
});

export const paginationSchema = z.object({
  totalPages: z.int(),
  totalItems: z.int(),
  hasMore: z.boolean(),
  currentPage: z.int(),
});

export const extendedPlatformSchema = platformSchema.safeExtend({
  minRequirements: z.string().nullable(),
  recRequirements: z.string().nullable(),
});

export const baseGameSchema = z.object({
  id: z.int(),
  name: z.string(),
  price: z.int().positive().transform(centsToDollars),
  introduction: z.string(),
  landscape: z.url(),
  releaseDate: z.coerce.date().transform(dateToFormat),
  rating: z.number().positive().lte(5),
});

export const gameListItemSchema = baseGameSchema.extend({
  genreIds: z.array(z.int()),
  platformIds: z.array(z.int()),
});

export const gameListSchema = z.array(gameListItemSchema);

export const gameSchema = baseGameSchema.safeExtend({
  description: z.string(),
  developer: z.string(),
  publisher: z.string(),
  portrait: z.string(),
  landscape: z.string(),
  raterCount: z.int(),
  platforms: z.array(extendedPlatformSchema),
  screenshots: z.array(screenshotSchema),
  movies: z.array(movieSchema),
  achievements: z.array(achievementSchema),
  userStars: z.int().nullable(),
});
