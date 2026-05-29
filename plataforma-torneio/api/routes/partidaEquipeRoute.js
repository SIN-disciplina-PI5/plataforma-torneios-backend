import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import {
  createPartidaEquipe,
  getPartidaEquipeById,
  getAllPartidasEquipe,
  updatePartidaEquipe,
  deletePartidaEquipe,
} from "../controllers/partidaEquipeController.js";

const router = Router();

router.post("/", authenticateToken, checkAdmin, rateLimiter, createPartidaEquipe);
router.get("/", authenticateToken, getAllPartidasEquipe);
router.get("/:id_partida_equipe", authenticateToken, getPartidaEquipeById);
router.patch("/:id_partida_equipe", authenticateToken, checkAdmin, rateLimiter, updatePartidaEquipe);
router.delete("/:id_partida_equipe", authenticateToken, checkAdmin, rateLimiter, deletePartidaEquipe);

export default router;