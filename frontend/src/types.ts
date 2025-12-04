import type z from "zod";
import type {
  achievementSchema,
  baseGameSchema,
  gameFilterSearchSchema,
  gameListItemSchema,
  gameListSchema,
  gameSchema,
  genreListSchema,
  genreSchema,
  movieSchema,
  extendedPlatformListSchema,
  platformListSchema,
  platformSchema,
  screenshotSchema,
  userSchema,
  extendedPlatformSchema,
  gameFilterSchema,
  gameSearchSchema,
  searchGameListSchema,
  cardAddSchema,
  paymentCardSchema,
} from "@/validators";

export type Genre = z.infer<typeof genreSchema>;
export type GenreList = z.infer<typeof genreListSchema>;
export type GenreMap = Map<number, Genre>;
export type Platform = z.infer<typeof platformSchema>;
export type PlatformList = z.infer<typeof platformListSchema>;
export type PlatformExtended = z.infer<typeof extendedPlatformSchema>;
export type PlatformListExtended = z.infer<typeof extendedPlatformListSchema>;
export type PlatformMap = Map<number, Platform>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Screenshot = z.infer<typeof screenshotSchema>;
export type Movie = z.infer<typeof movieSchema>;
export type BaseGame = z.infer<typeof baseGameSchema>;
export type SearchGameList = z.infer<typeof searchGameListSchema>;
export type GameListItem = z.infer<typeof gameListItemSchema>;
export type GameList = z.infer<typeof gameListSchema>;
export type Game = z.infer<typeof gameSchema>;
export type GameFilters = z.infer<typeof gameFilterSchema>;
export type GameFilterSearch = z.infer<typeof gameFilterSearchSchema>;
export type GameSearch = z.infer<typeof gameSearchSchema>;
export type User = z.infer<typeof userSchema>;
export type PaymentCard = z.infer<typeof paymentCardSchema>;
export type PaymentCardAdd = z.infer<typeof cardAddSchema>;
