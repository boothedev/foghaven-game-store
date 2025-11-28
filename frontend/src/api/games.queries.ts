import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { type GetGameKey, type GetGameListKey } from "./games.keys";
import { getGame, getGameList, searchGames } from "./games.requests";
import type { GameSearch } from "@/types";

function gameListInfiniteQuery(key: GetGameListKey) {
  return infiniteQueryOptions({
    queryKey: ["gameList", key],
    queryFn: ({ pageParam }) =>
      getGameList({ ...key, page: pageParam, size: 100 }),
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
    queryKey: ["game", key],
    queryFn: getGame.bind(null, key),
  });
}

function gameSearchQuery(key: GameSearch) {
  return queryOptions({
    queryKey: ["game", key],
    queryFn: searchGames.bind(null, key),
    initialData: [],
    staleTime: 0,
    gcTime: 0,
  });
}

export const gameQueries = {
  infinitePages: gameListInfiniteQuery,
  one: gameQuery,
  search: gameSearchQuery,
};
