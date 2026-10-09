import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL, issuer: "app-api", audience: "app-client" }
  );
}

export function createRefreshToken(userId, tokenId) {
  return jwt.sign(
    { sub: userId, jti: tokenId, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.REFRESH_TOKEN_DAYS}d`, issuer: "app-api", audience: "app-client" }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: "app-api", audience: "app-client" });
}
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: "app-api", audience: "app-client" });
}
export function newTokenId() {
  return crypto.randomUUID();
}
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
