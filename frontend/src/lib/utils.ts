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

export function expFormat(exp_month: number, exp_year: number) {
  return `${String(exp_month).padStart(2, "0")}/${String(exp_year).substring(2, 4).padStart(2, "0")}`;
}

export function cardNumberFormat(cardNumber: string) {
  return "***" + cardNumber.substring(cardNumber.length - 4);
}

// export function isSessionExpired() {
//   const toastHistory = toast.getHistory();
//   if (toastHistory.length === 0) return true;
//   console.log(toastHistory);
//   const lastToast = toastHistory[toastHistory.length - 1] as ToastT;
//   const isLogout = lastToast.title?.toString().toLowerCase().includes("logout");
//   return !isLogout;
// }

const RATING_TEXT_MAP = [
  { lowerbound: 4.75, description: "Overhwelmingly Positive" },
  { lowerbound: 4.5, description: "Very Positive" },
  { lowerbound: 4.0, description: "Positive" },
  { lowerbound: 3.5, description: "Mostly Positive" },
  { lowerbound: 2.5, description: "Mixed" },
  { lowerbound: 2.0, description: "Mostly Negative" },
  { lowerbound: 1.5, description: "Negative" },
  { lowerbound: 1.25, description: "Very Negative" },
  { lowerbound: 1.0, description: "Overwhelmingly Negative" },
];

export function ratingText(rating: number) {
  const target = RATING_TEXT_MAP.find(({ lowerbound }) => rating >= lowerbound);
  const safeTarget = target ?? RATING_TEXT_MAP[RATING_TEXT_MAP.length - 1];
  return safeTarget.description;
}

const USER_RATING_TEXT_MAP = [
  undefined,
  /* 1 */ "Terrible",
  /* 2 */ "Poor",
  /* 3 */ "Okay",
  /* 4 */ "Great",
  /* 5 */ "Outstanding",
];

export function userRatingText(stars?: number) {
  return USER_RATING_TEXT_MAP[stars ?? 0];
}
