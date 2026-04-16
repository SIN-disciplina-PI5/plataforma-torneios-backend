import { Router } from "express";
import {
  getRankingGeral,
  getRankingUsuario,
  getRankingByPosicao,
  atualizarPontuacao,
  recalcularRanking,
  resetarRankingUsuario,
} from "../controllers/rankingController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Rotas públicas (ou para usuários autenticados)
router.get("/geral", authenticateToken, rateLimiter, getRankingGeral);
router.get("/usuario/:id_usuario", authenticateToken, rateLimiter, getRankingUsuario);
router.get("/posicao/:posicao", authenticateToken, rateLimiter, getRankingByPosicao);

// Rotas de ADMIN
router.post("/atualizar", authenticateToken, checkAdmin, atualizarPontuacao);
router.post("/recalcular", authenticateToken, checkAdmin, recalcularRanking);
router.delete("/resetar/:id_usuario", authenticateToken, checkAdmin, resetarRankingUsuario);

export default router;