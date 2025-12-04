import { queryOptions } from "@tanstack/react-query";
import { GetAuthKey } from "./auth.keys";
import { currentuser } from "./auth.requests";

function authCurrentUserQuery() {
  return queryOptions({
    queryKey: [GetAuthKey],
    queryFn: currentuser,
  });
}

export const authQueries = {
  currentUser: authCurrentUserQuery,
};
