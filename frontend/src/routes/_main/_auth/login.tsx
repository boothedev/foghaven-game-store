import { useLogIn } from "@/api/auth.mutations";
import { LoginForm } from "@/components/LoginForm";
import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";

export const Route = createFileRoute("/_main/_auth/login")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Login",
      },
    ],
  }),
});

function RouteComponent() {
  const loginMutation = useLogIn();

  const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.toString().toLowerCase() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const remember = formData.get("remember") !== null;

    loginMutation.mutate({ username, password, remember });
  };

  return <LoginForm onSubmitHandler={onSubmitHandler} />;
}
