import { userSchema } from "@/validators";
import { useQueryClient } from "@tanstack/react-query";
import { GetAuthKey } from "./auth.keys";

type LoginParams = {
  username: string;
  password: string;
  remember: boolean;
};

type RegisterParams = {
  username: string;
  password: string;
};

export async function login(params: LoginParams) {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw await response.text();
  }

  const jsonData = await response.json();
  const data = userSchema.parse(jsonData);
  useQueryClient().setQueryData([GetAuthKey], data);
}

export async function register(params: RegisterParams) {
  const response = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw await response.text();
  }

  const jsonData = await response.json();
  const data = userSchema.parse(jsonData);
  useQueryClient().setQueryData([GetAuthKey], data);
}

export async function currentuser() {
  const response = await fetch("/api/currentuser");

  if (!response.ok) {
    return null;
  }

  const jsonData = await response.json();
  return userSchema.parse(jsonData);
}

export async function logout() {
  const response = await fetch("/api/logout", {
    method: "POST",
  });
  if (response.ok) {
    useQueryClient().invalidateQueries({ queryKey: [GetAuthKey] });
  }
}
