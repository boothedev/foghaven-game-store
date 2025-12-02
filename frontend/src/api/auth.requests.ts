import type { PaymentCardAdd } from "@/types";
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

export type UpdateUserParams = {
  current_password: string;
  new_username?: string;
  new_password?: string;
  topup?: number;
};

type GamePurchaseParams = {
  id: number;
};

type GameRateParams = {
  id: number;
  stars?: number;
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
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
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

export async function updateUser(params: UpdateUserParams) {
  const response = await fetch("/api/currentuser", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}

export async function currentuser() {
  const response = await fetch("/api/currentuser");
  const jsonData = await response.json();

  if (!response.ok) {
    throw Error(jsonData["detail"]);
  }

  return userSchema.parse(jsonData);
}

export async function logout() {
  const response = await fetch("/api/logout", {
    method: "POST",
  });
  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}

export async function removePaymentCard(id: number) {
  const response = await fetch(`/api/payment_cards/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}

export async function addPaymentCard(params: PaymentCardAdd) {
  const response = await fetch(`/api/payment_cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}

export async function purchaseGame(params: GamePurchaseParams) {
  const response = await fetch(`/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}

export async function rateGame({ id, stars }: GameRateParams) {
  const response = await fetch(`/api/games/${id}/ratings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stars }),
  });
  if (!response.ok) {
    const errorMsg = (await response.json())["detail"];
    throw Error(errorMsg);
  }
}
