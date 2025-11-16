import type { Game, GameList } from "@/types";
import { gameListSchema, gameSchema } from "@/validators";
import { prepareSearchParams } from "@/lib/utils";
import type { GetGameKey, GetGameListKey } from "./games.keys";

export async function getGameList(key: GetGameListKey): Promise<GameList> {
  const searchParams = prepareSearchParams(key);
  const response = await fetch(`/api/games?${searchParams}`);
  const data = await response.json();
  return gameListSchema.parse(data);
}

export async function getGame({ id }: GetGameKey): Promise<Game> {
  const response = await fetch(`/api/games/${id}`);
  const data = await response.json();
  return gameSchema.parse(data);
}
