import GameLibrary from "@/components/GameLibrary";
import Header from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import headerImage from "/header-game-list.webp";
import { gameFilterSchema, gameFilterSearchSchema } from "@/validators";
import { gameQueries } from "@/api/games.queries";
import { preloadImage } from "@/lib/utils";

export const Route = createFileRoute("/_main/store/")({
  loaderDeps: ({ search }) => gameFilterSchema.parse(search),
  loader: ({ context: { queryClient }, deps: search }) => {
    return queryClient
      .ensureInfiniteQueryData(gameQueries.infinitePages(search))
      .then((data) => {
        for (const games of data.pages) {
          for (const { landscape } of games) {
            preloadImage(landscape);
          }
        }
        return data;
      });
  },
  head: () => ({
    meta: [
      {
        title: "The Vault",
      },
    ],
  }),
  component: RouteComponent,
  validateSearch: gameFilterSearchSchema,
});

function RouteComponent() {
  const gameFilterSearch = Route.useSearch();

  return (
    <div className="flex flex-col">
      <Header
        imageUrl={headerImage}
        imageAlt="Library header image"
        title="The Vault"
      />
      <GameLibrary gameFilterSeach={gameFilterSearch} />
    </div>
  );
}
