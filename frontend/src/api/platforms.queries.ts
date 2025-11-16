import { queryOptions } from '@tanstack/react-query';
import type { GetPlatformKey } from './platforms.keys';

function platformListQuery() {
  return queryOptions({
    queryKey: ['platformList'],
    staleTime: Infinity,
  });
}

function platformQuery(key: GetPlatformKey) {
  return queryOptions({
    queryKey: ['platform', key],
    staleTime: Infinity,
  });
}

export const platformQueries = {
  all: platformListQuery,
  one: platformQuery,
};
