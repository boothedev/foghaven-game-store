import { login } from "@/api/auth.requests";
import { LoginForm } from "@/components/LoginForm";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { toast } from "sonner";

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

const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const username = formData.get("username")?.toString().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const remember = formData.get("remember") !== null;

  login({ username, password, remember })
    .then(() => {
      const nav = useNavigate();
      toast.success("Login successfully!");
      nav({ to: "/profile" });
    })
    .catch((errorMsg) => {
      toast.error("Unable to login", {
        description: errorMsg,
      });
    });
};

function RouteComponent() {
  return <LoginForm onSubmitHandler={onSubmitHandler} />;
}
