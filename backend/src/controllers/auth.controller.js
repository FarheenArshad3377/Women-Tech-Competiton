import { asyncHandler } from "../utils/async-handler.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";

function validate(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    error.status = 400;
    throw error;
  }
  return parsed.data;
}

export const register = asyncHandler(async (req, res) => {
  const data = validate(registerSchema, req.body);
  const session = await authService.register(data);
  setAuthCookies(res, session.accessToken, session.refreshToken);
  res.status(201).json({ user: session.user });
});

export const login = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);
  const session = await authService.login(data);
  setAuthCookies(res, session.accessToken, session.refreshToken);
  res.json({ user: session.user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: "Refresh token is required." });
  const session = await authService.refreshSession(token);
  setAuthCookies(res, session.accessToken, session.refreshToken);
  res.json({ user: session.user });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.refresh_token);
  clearAuthCookies(res);
  res.status(204).end();
});
