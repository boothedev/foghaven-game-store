import { authQueries } from "@/api/auth.queries";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import headerImage from "/header-profile.webp";
import { ProfileInfo } from "@/components/ProfileInfo";

export const Route = createFileRoute("/_main/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isFetched, isError } = useQuery(authQueries.currentUser());
  if ((isFetched && data === undefined) || isError) {
    throw redirect({ to: "/login" });
  }

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
