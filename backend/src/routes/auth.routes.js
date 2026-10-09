import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, me, refresh, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Try again later." }
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);

export default router;
