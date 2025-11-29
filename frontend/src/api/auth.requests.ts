import { userSchema } from "@/validators";

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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw (await response.json())["detail"];
  }
}

export async function register(params: RegisterParams) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw (await response.json())["detail"];
  }
}

export async function currentuser() {
  const response = await fetch("/api/currentuser");
  const jsonData = await response.json();

  if (!response.ok) {
    throw jsonData["detail"];
  }

  return userSchema.parse(jsonData);
}

export async function logout() {
  const response = await fetch("/api/logout", {
    method: "POST",
  });
  if (!response.ok) {
    throw (await response.json())["detail"];
  }
}
