import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { login, logout } from "../controllers/authController.js";
import { criarUsuario, editarPerfil, deletarPerfil } from "../controllers/userController.js";

const router = Router();

router.post("/login", rateLimiter, login);
router.post("/logout", authenticateToken, logout);
router.post("/signup", rateLimiter, criarUsuario);
router.patch("/edit/:id_usuario", authenticateToken, rateLimiter, editarPerfil);
router.delete("/delete/:id_usuario", authenticateToken, rateLimiter, deletarPerfil);

export default router;