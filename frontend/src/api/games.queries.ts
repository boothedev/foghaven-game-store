import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  DEFAULT_GET_GAMES_KEYS,
  type GetGameKey,
  type GetGameListKey,
} from './games.keys';
import { getGame, getGameList } from './games.requests';

function _gameListQuery(key: GetGameListKey) {
  return queryOptions({
    queryKey: ['gameList', key],
    queryFn: getGameList.bind(null, key),
  });
}

function gameListInfiniteQuery(partialKey: Partial<GetGameListKey> = {}) {
  const key: GetGameListKey = { ...DEFAULT_GET_GAMES_KEYS, ...partialKey };

  return infiniteQueryOptions({
    queryKey: ['gameList', key],
    queryFn: ({ pageParam }) => getGameList({ ...key, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length !== 0) {
        return lastPageParam + 1;
      }
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      if (firstPageParam > 1) {
        return firstPageParam - 1;
      }
    },
  });
}

function gameQuery(key: GetGameKey) {
  return queryOptions({
    queryKey: ['game', key],
    queryFn: getGame.bind(null, key),
  });
}

export const gameQueries = {
  infinitePages: gameListInfiniteQuery,
  one: gameQuery,
};
