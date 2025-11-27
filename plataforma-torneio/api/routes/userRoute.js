import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { login, logout } from "../controllers/authController.js";
import { criarUsuario, editarPerfil, deletarPerfil } from "../controllers/userController.js";

const router = Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/signup", criarUsuario);
router.patch("/edit/:id_usuario", authenticateToken, editarPerfil);
router.delete("/delete/:id_usuario", authenticateToken, deletarPerfil);

export default router;