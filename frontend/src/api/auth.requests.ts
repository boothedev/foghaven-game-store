import { userSchema } from "@/validators";
import { useQueryClient } from "@tanstack/react-query";
import { GetAuthKey } from "./auth.keys";

type LoginParams = {
  username: string;
  password: string;
  remember: boolean;
};

export async function login(params: LoginParams) {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const jsonData = await response.json();
  const data = userSchema.parse(jsonData);
  useQueryClient().setQueryData([GetAuthKey], data);
}

export async function currentuser() {
  const response = await fetch("/api/currentuser");
  const jsonData = await response.json();
  return userSchema.parse(jsonData);
}
