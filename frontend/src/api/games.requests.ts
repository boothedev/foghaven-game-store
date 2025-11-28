import type {
  Game,
  GameFilters,
  GameList,
  GameSearch,
  SearchGameList,
} from "@/types";
import { gameListSchema, gameSchema, searchGameListSchema } from "@/validators";
import { prepareSearchParams } from "@/lib/utils";
import type { GetGameKey } from "./games.keys";

type GetGameListParams = GameFilters;
type SearchGameParams = GameSearch;

export async function getGameList(key: GetGameListParams): Promise<GameList> {
  const searchParams = prepareSearchParams(key);
  const response = await fetch(`/api/games?${searchParams}`);
  const data = await response.json();
  return gameListSchema.parse(data);
}

export async function searchGames(
  key: SearchGameParams
): Promise<SearchGameList> {
  if (key.search.length === 0) {
    return [];
  }

  const searchParams = prepareSearchParams(key);
  const response = await fetch(`/api/games?${searchParams}`);
  const data = await response.json();
  return searchGameListSchema.parse(data);
}

export async function getGame({ id }: GetGameKey): Promise<Game> {
  const response = await fetch(`/api/games/${id}`);
  const data = await response.json();
  return gameSchema.parse(data);
}
