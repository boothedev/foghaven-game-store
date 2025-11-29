import { authQueries } from "@/api/auth.queries";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import headerImage from "/header-profile.webp";
import { ProfileInfo } from "@/components/ProfileInfo";
import { toast } from "sonner";
import { isLoggedIn } from "@/lib/utils";

export const Route = createFileRoute("/_main/profile")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    if (!isLoggedIn()) throw "Haven't logged in yet";
    return queryClient.ensureQueryData(authQueries.currentUser());
  },
  onError: (e) => {
    toast.error(e);
    throw redirect({
      to: "/login",
    });
  },
  head: () => ({
    meta: [
      {
        title: "My Arcana",
      },
    ],
  }),
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <div className="flex flex-col">
      <Header
        imageUrl={headerImage}
        imageAlt="Profile header image"
        title="My Arcana"
      />
      {data === undefined ? <div>loading...</div> : <ProfileInfo user={data} />}
    </div>
  );
}
