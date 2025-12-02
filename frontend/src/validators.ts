import { z } from "zod";
import {
  cardNumberFormat,
  centsToDollars,
  dateToFormat,
  expFormat,
} from "@/lib/utils";

export const paramIntArraySchema = z
  .array(z.int().positive())
  .nonempty()
  .or(
    z
      .int()
      .positive()
      .transform((arg) => [arg])
  )
  .or(z.string().transform((arg) => arg.split("_").map((arg) => Number(arg))));

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
  owned: z.coerce.boolean().default(false),
  genre_ids: paramIntArraySchema,
  platform_ids: paramIntArraySchema,
});

export const gameListSchema = z.array(gameListItemSchema);

export const user_stars = z
  .object({
    stars: z.int().nullable().optional(),
    owned_at: z.coerce.date(),
  })
  .transform((arg) => ({ ...arg, stars: arg.stars ?? undefined }));

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
    owned: user_stars.nullable().optional(),
    background: z.url().optional(),
  })
  .transform((arg) => ({
    ...arg,
    owned: arg.owned ?? undefined,
    background: arg.background
      ? arg.background
      : `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${arg.id}/page_bg_raw.jpg`,
  }));

export const cardAddSchema = z.object({
  name: z.string(),
  number: z.string().length(16),
  exp_month: z.int().positive(),
  exp_year: z.int().positive(),
  security_code: z.coerce.string(),
});

export const paymentCardSchema = cardAddSchema
  .extend({
    id: z.int(),
  })
  .transform((arg) => ({
    ...arg,
    number: cardNumberFormat(arg["number"]),
    exp: expFormat(arg["exp_month"], arg["exp_year"]),
  }));

export const userSchema = z.object({
  username: z.string(),
  balance: z.int().nonnegative().transform(centsToDollars),
  cards: z.array(paymentCardSchema),
  owned: z.int().default(0),
});

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

export const redirectSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/[-\w\/]*]/)
    .optional(),
});
