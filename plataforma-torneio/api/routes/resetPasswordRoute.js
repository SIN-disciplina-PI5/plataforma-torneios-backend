import { Router } from "express";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { forgotPassword, resetPassword } from "../controllers/resetPasswordController.js";

const router = Router();

router.post("/forgot-password", rateLimiter, forgotPassword);
router.post("/reset-password", rateLimiter, resetPassword);

export default router;