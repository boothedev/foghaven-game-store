import type { Genre, GenreMap } from "@/types";
import { genreListSchema, genreSchema } from "@/validators";
import type { GetGenreKey } from "./genres.keys";

export async function getGenreList(): Promise<GenreMap> {
  const response = await fetch("/api/genres");
  const data = await response.json();
  const genres = genreListSchema.parse(data);
  const genreIdMap = genres.reduce((acc, item) => {
    acc.set(item.id, item);
    return acc;
  }, new Map<number, Genre>());
  return genreIdMap;
}

export async function getGenre({ id }: GetGenreKey): Promise<Genre> {
  const response = await fetch(`/api/genre/${id}`);
  const data = await response.json();
  return genreSchema.parse(data);
}
