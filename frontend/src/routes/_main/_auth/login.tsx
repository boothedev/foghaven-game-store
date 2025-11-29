import { login } from "@/api/auth.requests";
import { LoginForm } from "@/components/LoginForm";
import {
  createFileRoute,
  useNavigate,
  type UseNavigateResult,
} from "@tanstack/react-router";
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

const onSubmitHandler = (
  navigate: UseNavigateResult<string>,
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const username = formData.get("username")?.toString().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const remember = formData.get("remember") !== null;

  login({ username, password, remember })
    .then(() => {
      toast.success("Login successfully!");
      navigate({
        to: "/profile",
      });
    })
    .catch((errorMsg) => {
      toast.error("Unable to login", {
        description: errorMsg,
      });
    });
};

function RouteComponent() {
  const navigate = useNavigate();

  return <LoginForm onSubmitHandler={onSubmitHandler.bind(null, navigate)} />;
}
