import { Router } from "express";
import { login, createUser, editProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/login", login);
router.post("/signup", createUser);
router.patch("/edit", authenticateToken, editProfile);

export default router;