import type { Genre, GenreMap } from '@/types';
import { genreSchema } from '@/validators';
import type { GetGenreKey } from './genres.keys';
import { genreListSamples } from './genres.samples';

// export async function getGenreList(): Promise<GenreList> {
//   const response = await fetch('/api/genres');
//   const data = await response.json();
//   return genreListSchema.parse(data);
// }

export async function getGenre({ id }: GetGenreKey): Promise<Genre> {
  const response = await fetch(`/api/genre/${id}`);
  const data = await response.json();
  return genreSchema.parse(data);
}

export async function getGenreList(): Promise<GenreMap> {
  const genreIdMap = genreListSamples.reduce((acc, item) => {
    acc.set(item.id, item);
    return acc;
  }, new Map<number, Genre>());
  return genreIdMap;
}
