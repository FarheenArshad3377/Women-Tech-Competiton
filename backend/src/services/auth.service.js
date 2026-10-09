import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { env } from "../config/env.js";
import { createAccessToken, createRefreshToken, hashToken, newTokenId, verifyRefreshToken } from "../utils/tokens.js";

const publicUser = (row) => ({ id: row.id, name: row.name, email: row.email, createdAt: row.created_at });

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
    [name, email, passwordHash]
  );
  return issueSession(result.rows[0]);
}

export async function login({ email, password }) {
  const result = await query(
    "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }
  return issueSession(user);
}

async function issueSession(user) {
  const tokenId = newTokenId();
  const refreshToken = createRefreshToken(user.id, tokenId);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400000);
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [user.id, hashToken(refreshToken), expiresAt]
  );
  return { user: publicUser(user), accessToken: createAccessToken(user), refreshToken };
}

export async function refreshSession(rawToken) {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    const error = new Error("Refresh token is invalid or expired.");
    error.status = 401;
    throw error;
  }
  if (payload.type !== "refresh" || !payload.sub || !payload.jti) {
    const error = new Error("Invalid refresh token.");
    error.status = 401;
    throw error;
  }

  // Atomically consume the previous token. A reused token cannot create a second session.
  const clientResult = await query(
    `DELETE FROM refresh_tokens
     WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()
     RETURNING user_id`,
    [payload.sub, hashToken(rawToken)]
  );
  if (!clientResult.rowCount) {
    const error = new Error("Refresh token has already been used or revoked. Please sign in again.");
    error.status = 401;
    throw error;
  }

  const userResult = await query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [payload.sub]
  );
  if (!userResult.rowCount) {
    const error = new Error("User not found.");
    error.status = 401;
    throw error;
  }
  return issueSession(userResult.rows[0]);
}

export async function logout(rawToken) {
  if (rawToken) {
    await query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hashToken(rawToken)]);
  }
}
