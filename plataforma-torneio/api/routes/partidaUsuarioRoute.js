import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import {
  createPartidaUsuario,
  getPartidaUsuarioById,
  getAllPartidasUsuario,
  updatePartidaUsuario,
  deletePartidaUsuario,
} from "../controllers/partidaUsuarioController.js";

const router = Router();

router.post("/", authenticateToken, checkAdmin, rateLimiter, createPartidaUsuario);
router.get("/", authenticateToken, getAllPartidasUsuario);
router.get("/:id_partida_usuario", authenticateToken, getPartidaUsuarioById);
router.patch("/:id_partida_usuario", authenticateToken, checkAdmin, rateLimiter, updatePartidaUsuario);
router.delete("/:id_partida_usuario", authenticateToken, checkAdmin, rateLimiter, deletePartidaUsuario);

export default router;