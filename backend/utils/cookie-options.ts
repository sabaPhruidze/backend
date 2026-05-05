import type { CookieOptions } from "express";

export const REFRESH_COOKIE_NAME = "refresh";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const getCookieSameSite = (): CookieOptions["sameSite"] => {
  return (
    (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) ??
    "lax"
  );
};

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "development",
  sameSite: getCookieSameSite(),
  path: "/api/users/refresh",
  maxAge: REFRESH_COOKIE_MAX_AGE,
});
export const getClearRefreshCookieOptions = (): CookieOptions => {
  const { maxAge, ...clearOptions } = getRefreshCookieOptions();
  return clearOptions;
};
