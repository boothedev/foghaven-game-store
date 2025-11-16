import type z from 'zod';
import type {
  achievementSchema,
  baseGameSchema,
  gameListItemSchema,
  gameListSchema,
  gameSchema,
  genreListSchema,
  genreSchema,
  movieSchema,
  paginationSchema,
  platformListSchema,
  platformSchema,
  screenshotSchema,
} from '@/validators';

export type Genre = z.infer<typeof genreSchema>;
export type GenreList = z.infer<typeof genreListSchema>;
export type GenreMap = Map<number, Genre>;
export type Platform = z.infer<typeof platformSchema>;
export type PlatformList = z.infer<typeof platformListSchema>;
export type PlatformMap = Map<number, Platform>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Screenshot = z.infer<typeof screenshotSchema>;
export type Movie = z.infer<typeof movieSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type BaseGame = z.infer<typeof baseGameSchema>;
export type GameListItem = z.infer<typeof gameListItemSchema>;
export type GameList = z.infer<typeof gameListSchema>;
export type Game = z.infer<typeof gameSchema>;
