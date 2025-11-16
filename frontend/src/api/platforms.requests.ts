import type { Platform, PlatformMap } from '@/types';
import { platformListSamples } from './platforms.sample';

// export async function getPlatforms(): Promise<PlatformList> {
//   const response = await fetch('/api/platforms');
//   const data = await response.json();
//   return platformListSchema.parse(data);
// }

// export async function getPlatform({ id }: GetPlatformKey): Promise<Platform> {
//   const response = await fetch(`/api/platform/${id}`);
//   const data = await response.json();
//   return platformSchema.parse(data);
// }

export async function getGenreList(): Promise<PlatformMap> {
  const platformIdMap = platformListSamples.reduce((acc, item) => {
    acc.set(item.id, item);
    return acc;
  }, new Map<number, Platform>());
  return platformIdMap;
}
