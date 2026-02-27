import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { login, logout } from "../controllers/authController.js";
import {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  getHistoricoUsuario,
  getPerfilCompleto,
} from "../controllers/userController.js";

const router = Router();

router.post("/login", rateLimiter, login);
router.post("/signup", rateLimiter, createUsuario);

router.get("/historico", authenticateToken, getHistoricoUsuario);
router.get("/perfil", authenticateToken, getPerfilCompleto); // nova rota para perfil completo
router.get("/:id_usuario", authenticateToken, getUsuarioById);
router.patch("/edit/:id_usuario", authenticateToken, rateLimiter, updateUsuario);
router.delete("/delete/:id_usuario", authenticateToken, rateLimiter, deleteUsuario);
router.get("/", authenticateToken, getAllUsuarios);
router.post("/logout", authenticateToken, logout);

export default router;