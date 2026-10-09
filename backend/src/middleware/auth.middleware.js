import { verifyAccessToken } from "../utils/tokens.js";
import { asyncHandler } from "../utils/async-handler.js";
import { query } from "../config/db.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "Authentication required." });

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token." });
  }
  if (payload.type !== "access" || !payload.sub) {
    return res.status(401).json({ error: "Invalid access token." });
  }

  const result = await query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [payload.sub]
  );
  if (!result.rowCount) return res.status(401).json({ error: "User no longer exists." });
  req.user = result.rows[0];
  next();
});
