import { Router } from "express";
import { 
  buscarRankingGeral,
  buscarRankingUsuario,
  buscarPorPosicao,
  atualizarPontuacao,
  recalcularRanking,
  resetarRankingUsuario
} from "../controllers/rankingController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Rotas públicas 
router.get("/geral", authenticateToken, rateLimiter, buscarRankingGeral);
router.get("/usuario/:id_usuario", authenticateToken, rateLimiter, buscarRankingUsuario);
router.get("/posicao/:posicao", authenticateToken, rateLimiter, buscarPorPosicao);

//Rotas de ADMIN 
router.post("/atualizar", authenticateToken, checkAdmin, atualizarPontuacao);
router.post("/recalcular", authenticateToken, checkAdmin, recalcularRanking);
router.delete("/resetar/:id_usuario", authenticateToken, checkAdmin, resetarRankingUsuario);

export default router;