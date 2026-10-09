import { env } from "../config/env.js";

const common = {
  httpOnly: true,
  secure: env.COOKIE_SECURE === "true" || env.NODE_ENV === "production",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/"
};

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, {
    ...common,
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  });
}
export function clearAuthCookies(res) {
  res.clearCookie("access_token", { ...common, maxAge: undefined });
  res.clearCookie("refresh_token", { ...common, maxAge: undefined });
}
