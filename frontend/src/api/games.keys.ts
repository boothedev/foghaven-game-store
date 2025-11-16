export type GetGameListKey = {
  page: number;
  limit: number;
  genres?: number[];
  platforms?: number[];
  sort: 'rating' | 'rater_count';
  order: 'asc' | 'desc';
  owned?: boolean;
};

export type GetGameKey = {
  id: number;
};

export const DEFAULT_GET_GAMES_KEYS: GetGameListKey = {
  page: 1,
  limit: 50,
  sort: 'rating',
  order: 'desc',
};
