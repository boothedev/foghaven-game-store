import { GlobalStarDefs } from "@/components/StarRating";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/store")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Loading...",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <>
      <GlobalStarDefs />
      <Outlet />
    </>
  );
}
