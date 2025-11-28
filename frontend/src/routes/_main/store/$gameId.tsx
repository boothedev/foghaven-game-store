import { gameQueries } from "@/api/games.queries";
import { GamePage } from "@/components/GamePage";
import { preloadImage } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/store/$gameId")({
  component: RouteComponent,
  loader: async ({ params: { gameId }, context: { queryClient } }) => {
    return queryClient
      .ensureQueryData(gameQueries.one({ id: Number(gameId) }))
      .then((game) => {
        [game.portrait, game.background].forEach((url) => preloadImage(url));
        return game;
      });
  },

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.name,
      },
      {
        name: "description",
        content: loaderData?.description.replaceAll(/<[^>]+>/g, ""),
      },
    ],
  }),
  pendingComponent: Skeleton,
  onError: () => {
    toast.warning("Unable to load this game.");
    throw redirect({ to: "/store" });
  },
  shouldReload: false,
  preload: true,
});

function Skeleton() {
  return <div>Loading...</div>;
}

function RouteComponent() {
  const { gameId } = Route.useParams();
  const { data: game } = useSuspenseQuery(
    gameQueries.one({ id: Number(gameId) })
  );

  return <GamePage game={game} />;
}
