import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import z from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const prepareSearchParams = (
  params: Record<string, unknown>,
): URLSearchParams => {
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          urlSearchParams.append(key, String(item));
        }
      });
    } else {
      urlSearchParams.append(key, String(value));
    }
  });

  return urlSearchParams;
};

export const caseTranformSnakeToKekab = (
  data: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(data).map(([key, val]) => [key.replaceAll('_', '-'), val]),
  );

export const caseTranformSnakeToCamel = (
  data: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(data).map(([key, val]) => [
      key.replace(/'_[a-z]'/g, (data) => data[1].toUpperCase()),
      val,
    ]),
  );

export const centsToDollars = (priceInCents: number) => {
  const priceInDollars = priceInCents / 100;
  return priceInDollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const dateToFormat = (date: Date) => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.toLocaleString('en-US', { day: '2-digit' });
  const year = date.toLocaleString('en-US', { year: 'numeric' });

  return `${month} ${day}, ${year}`;
};

export const camelKeyTransform = z.transform(
  (data: Record<string, unknown> | Record<string, unknown>[]) => {
    const fn = (data: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(data).map(([key, val]) => [
          key.replace(/([-_][a-z])/g, (match) => match[1].toUpperCase()),
          val,
        ]),
      );

    if (Array.isArray(data)) {
      const rs = data.map(fn);
      return rs;
    }
    return fn(data);
  },
);
