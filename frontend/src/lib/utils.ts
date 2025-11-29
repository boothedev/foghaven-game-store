import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const prepareSearchParams = (
  params: Record<string, unknown>
): URLSearchParams => {
  const entries = Object.entries(params);
  const keyValPairs = entries.flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => [key, String(item)]);
    }
    return [[key, String(value)]];
  });
  return new URLSearchParams(keyValPairs);
};

// export const caseTranformSnakeToKekab = (
//   data: Record<string, unknown>
// ): Record<string, unknown> =>
//   Object.fromEntries(
//     Object.entries(data).map(([key, val]) => [key.replaceAll("_", "-"), val])
//   );

// export const caseTranformSnakeToCamel = (
//   data: Record<string, unknown>
// ): Record<string, unknown> =>
//   Object.fromEntries(
//     Object.entries(data).map(([key, val]) => [
//       key.replace(/'_[a-z]'/g, (data) => data[1].toUpperCase()),
//       val,
//     ])
//   );

export const centsToDollars = (priceInCents: number) => {
  const priceInDollars = priceInCents / 100;
  return priceInDollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const dateToFormat = (date: Date) => {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const year = date.toLocaleString("en-US", { year: "numeric" });

  return `${month} ${day}, ${year}`;
};

export const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

export function isLoggedIn() {
  return document.cookie.includes("session_id=");
}
