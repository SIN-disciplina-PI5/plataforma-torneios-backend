import { Router } from "express";
import { login, logout, createUser, editProfile, deleteProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/signup", createUser);
router.patch("/edit/:id_usuario", authenticateToken, editProfile);
router.delete("/delete/:id_usuario", authenticateToken, deleteProfile);

export default router;