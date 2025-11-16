import { queryOptions } from '@tanstack/react-query';
import type { GetGenreKey } from './genres.keys';
import { getGenre, getGenreList } from './genres.requests';

function genreListQuery() {
  return queryOptions({
    queryKey: ['genreList'],
    queryFn: () => getGenreList(),
    staleTime: Infinity,
  });
}

function genreQuery(key: GetGenreKey) {
  return queryOptions({
    queryKey: ['genre', key],
    queryFn: () => getGenre(key),
    staleTime: Infinity,
  });
}

export const genreQueries = {
  all: genreListQuery,
  one: genreQuery,
};
