import express from "express";
import {
  listarNotificacoes,
  criarNotificacao,
  marcarComoLida,
} from "../controllers/notificacaoController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js"; 
import { checkAdmin } from "../middlewares/checkAdmin.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();


router.get("/", authenticateToken, rateLimiter, listarNotificacoes);
router.post("/", authenticateToken, rateLimiter, checkAdmin, criarNotificacao);
router.patch("/:id/read", authenticateToken, rateLimiter, marcarComoLida);

export default router;