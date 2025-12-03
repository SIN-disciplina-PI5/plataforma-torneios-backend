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



// GET    http://localhost:8080/api/ranking/geral                     // user
// GET    http://localhost:8080/api/ranking/usuario/UUID_DO_USUARIO   // user
// GET    http://localhost:8080/api/ranking/posicao/1                 // user

// POST   http://localhost:8080/api/ranking/atualizar                 // admin
// JSON: { "id_usuario": "UUID_DO_USUARIO", "tipo_evento": "VITORIA_FASE_GRUPOS" }

// POST   http://localhost:8080/api/ranking/atualizar                 // admin
// JSON: { "id_usuario": "UUID_DO_USUARIO", "tipo_evento": "AVANCO_FASE" }

// POST   http://localhost:8080/api/ranking/atualizar                 // admin
// JSON: { "id_usuario": "UUID_DO_USUARIO", "tipo_evento": "FINALISTA" }

// POST   http://localhost:8080/api/ranking/atualizar                 // admin
// JSON: { "id_usuario": "UUID_DO_USUARIO", "tipo_evento": "CAMPEAO", "medalha": "OURO" }

// DELETE http://localhost:8080/api/ranking/resetar/UUID_DO_USUARIO   // admin

// POST   http://localhost:8080/api/ranking/recalcular                // admin
// JSON: {} (normalmente vazio)
