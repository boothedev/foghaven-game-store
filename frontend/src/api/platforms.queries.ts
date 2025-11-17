import { queryOptions } from "@tanstack/react-query";
import type { GetPlatformKey } from "./platforms.keys";
import { getPlatform, getPlatformList } from "./platforms.requests";

function platformListQuery() {
  return queryOptions({
    queryKey: ["platformList"],
    queryFn: () => getPlatformList(),
    staleTime: Infinity,
  });
}

function platformQuery(key: GetPlatformKey) {
  return queryOptions({
    queryKey: ["platform", key],
    queryFn: () => getPlatform(key),
    staleTime: Infinity,
  });
}

export const platformQueries = {
  all: platformListQuery,
  one: platformQuery,
};
