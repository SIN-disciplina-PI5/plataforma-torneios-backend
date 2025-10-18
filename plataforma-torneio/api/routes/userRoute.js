import { Router } from "express";
import { login, logout, createUser, editProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/signup", createUser);
router.patch("/edit/:id_usuario", authenticateToken, editProfile);

export default router;