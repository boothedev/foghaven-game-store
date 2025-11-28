import { z } from "zod";
import { centsToDollars, dateToFormat } from "@/lib/utils";

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
  id: z.int(),
  name: z.string(),
  thumbnail: z.string(),
});

export const screenshotSchema = z.object({
  id: z.int(),
  thumbnail: z.string(),
  content: z.string(),
});

export const movieSchema = z.object({
  id: z.int(),
  thumbnail: z.string(),
  content_sd: z.string(),
  content_max: z.string(),
});

export const extendedPlatformSchema = platformSchema.safeExtend({
  min_requirements: z.string().nullable(),
  rec_requirements: z.string().nullable(),
});

export const extendedPlatformListSchema = z.array(extendedPlatformSchema);

export const baseGameSchema = z.object({
  id: z.int(),
  name: z.string(),
  price: z.int().positive().transform(centsToDollars),
  introduction: z.string(),
  landscape: z.url(),
  release_date: z.coerce.date().transform(dateToFormat),
  rating: z.number().positive().lte(5),
});

export const baseGameListSchema = z.array(baseGameSchema);

export const searchGameSchema = z.object({
  id: z.int(),
  name: z.string(),
  price: z.int().positive().transform(centsToDollars),
  landscape: z.url(),
  release_date: z.coerce.date().transform(dateToFormat),
  rating: z.number().positive().lte(5),
});

export const searchGameListSchema = z.array(searchGameSchema);

export const gameListItemSchema = baseGameSchema.extend({
  genre_ids: z.array(z.int()),
  platform_ids: z.array(z.int()),
});

export const gameListSchema = z.array(gameListItemSchema);

export const gameSchema = baseGameSchema
  .safeExtend({
    description: z.string(),
    developer: z.string(),
    publisher: z.string(),
    portrait: z.url(),
    landscape: z.url(),
    rater_count: z.int(),
    genres: genreListSchema,
    platforms: extendedPlatformListSchema,
    screenshots: z.array(screenshotSchema),
    movies: z.array(movieSchema),
    achievements: z.array(achievementSchema),
    user_stars: z.int().nullable().optional(),
  })
  .transform((arg) => ({
    ...arg,
    background: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${arg.id}/page_bg_raw.jpg`,
  }));

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

export const paramIntArraySchema = z
  .array(z.int().positive())
  .nonempty()
  .or(
    z
      .int()
      .positive()
      .transform((arg) => [arg])
  )
  .or(z.string().transform((arg) => arg.split("_").map((arg) => Number(arg))))
  .optional()
  .catch((_) => undefined);

export const searchParamIntArrayStringSchema = paramIntArraySchema.transform(
  (arg) => {
    if (arg) {
      let newArg = arg.join("_");
      return arg.length === 1 ? Number(newArg) : newArg;
    }
  }
);

const gameFilterBaseSchema = z.object({
  sort: z
    .enum(["rating", "rater_count"])
    .default("rater_count")
    .catch((_) => "rater_count"),
  order: z
    .enum(["asc", "desc"])
    .default("desc")
    .catch((_) => "desc"),
  owned: z
    .boolean()
    .optional()
    .transform((arg) => (arg === true ? true : undefined))
    .catch((_) => undefined),
});

export const gameFilterSearchSchema = gameFilterBaseSchema.safeExtend({
  genres: searchParamIntArrayStringSchema.optional().catch((_) => undefined),
  platforms: searchParamIntArrayStringSchema.optional().catch((_) => undefined),
});

export const gameFilterSchema = gameFilterBaseSchema.safeExtend({
  genres: paramIntArraySchema.optional().catch((_) => undefined),
  platforms: paramIntArraySchema.optional().catch((_) => undefined),
  page: z.int().positive().default(1),
  size: z.int().positive().lte(100).default(100),
});

export const gameSearchSchema = z.object({
  search: z.string(),
});
