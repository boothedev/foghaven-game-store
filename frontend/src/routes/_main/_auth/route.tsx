import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import backgroundUrl from "/bg-auth.png";
import { preloadImage } from "@/lib/utils";
import { isLoggedIn } from "@/lib/utils";
import { useCookieUpdate } from "@/hooks/use-cookie-update";
import { useEffect } from "react";
import { redirectSearchSchema } from "@/validators";

export const Route = createFileRoute("/_main/_auth")({
  component: RouteComponent,
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/profile" });
    }
  },
  validateSearch: redirectSearchSchema,
  loader: () => preloadImage(backgroundUrl),
  preload: true,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated } = useCookieUpdate();

  useEffect(() => {
    if (isAuthenticated) {
      search["redirect"];
      navigate({
        to: search.redirect ?? "/profile",
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <img
        src={backgroundUrl}
        alt="Login background"
        className="absolute inset-0 h-full w-full object-cover brightness-100 -z-10"
      />
      <div className="z-10 w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
