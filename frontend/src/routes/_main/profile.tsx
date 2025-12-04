import { authQueries } from "@/api/auth.queries";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ProfileInfo } from "@/components/ProfileInfo";
import { toast } from "sonner";
import { isLoggedIn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCookieUpdate } from "@/hooks/use-cookie-update";
import { useEffect } from "react";

export const Route = createFileRoute("/_main/profile")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    if (!isLoggedIn()) throw "Haven't logged in yet";
    return queryClient.ensureQueryData(authQueries.currentUser());
  },
  pendingComponent: () => {
    return "Loading...";
  },
  onError: (error: Error) => {
    toast.error("Unable to load current user", { description: error.message });
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
  const { isAuthenticated } = useCookieUpdate();
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery(authQueries.currentUser());

  useEffect(() => {
    if (isAuthenticated) return;
    navigate({ from: "/profile", to: "/login" });
  }, [isAuthenticated]);

  return <ProfileInfo user={user} />;
}
