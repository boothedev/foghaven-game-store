import type { Platform, PlatformMap } from "@/types";
import { platformListSchema, platformSchema } from "@/validators";
import type { GetGenreKey } from "./genres.keys";

export async function getPlatformList(): Promise<PlatformMap> {
  const response = await fetch("/api/platforms");
  const data = await response.json();
  const platforms = platformListSchema.parse(data);
  const platformIdMap = platforms.reduce((acc, item) => {
    acc.set(item.id, item);
    return acc;
  }, new Map<number, Platform>());
  return platformIdMap;
}

export async function getPlatform({ id }: GetGenreKey): Promise<Platform> {
  const response = await fetch(`/api/platforms/${id}`);
  const data = await response.json();
  return platformSchema.parse(data);
}
