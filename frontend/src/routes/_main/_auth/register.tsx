import { register } from "@/api/auth.requests";
import { RegisterForm } from "@/components/RegisterForm";
import {
  createFileRoute,
  useNavigate,
  type UseNavigateResult,
} from "@tanstack/react-router";
import type { FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/_auth/register")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Register",
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
  const rePassword = formData.get("re-password")?.toString() ?? "";

  if (password !== rePassword) {
    toast.error("Passwords do not match.");
    return;
  }

  register({ username, password })
    .then(() => {
      toast.success("Register successfully!");
      navigate({
        to: "/login",
      });
    })
    .catch((errorMsg) => {
      toast.error("Unable to register.", {
        description: errorMsg,
      });
    });
};

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <RegisterForm onSubmitHandler={onSubmitHandler.bind(null, navigate)} />
  );
}
