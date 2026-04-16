import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import {
  createPartida,
  getPartidaById,
  getAllPartidas,
  updatePartida,
  deletePartida,
  agendar,
  iniciar,
  finalizar,
} from "../controllers/partidaController.js";

const router = Router();

// Rotas que podem ser acessadas por usuários autenticados
router.post("/", authenticateToken, checkAdmin, rateLimiter, createPartida);
router.get("/", authenticateToken, getAllPartidas);
router.get("/:id_partida", authenticateToken, getPartidaById);

// Rotas administrativas
router.patch("/:id_partida", authenticateToken, checkAdmin, rateLimiter, updatePartida);
router.delete("/:id_partida", authenticateToken, checkAdmin, rateLimiter, deletePartida);
router.patch("/agendar/:id_partida", authenticateToken, checkAdmin, rateLimiter, agendar);
router.patch("/iniciar/:id_partida", authenticateToken, checkAdmin, rateLimiter, iniciar);
router.patch("/finalizar/:id_partida", authenticateToken, checkAdmin, rateLimiter, finalizar);

export default router;