import { Router } from "express";
import { login, logout, me } from "../controllers/auth.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { strictRateLimit } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/login", strictRateLimit, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
