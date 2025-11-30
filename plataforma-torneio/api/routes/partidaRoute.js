import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { isAdmin } from "../middlewares/authorize.js";
import {
  criarPartida,
  buscarPartida,
  listarPartidas,
  editarPartida,
  deletarPartida,
  agendar,
  iniciar,
  registrarResultado,
  definirVencedor,
  finalizar
} from "../controllers/partidaController.js";

const router = Router();

router.post("/", authenticateToken, isAdmin, rateLimiter, criarPartida);
router.get("/", authenticateToken, listarPartidas);
router.get("/:id_partida", authenticateToken, buscarPartida);
router.patch("/edit/:id_partida", authenticateToken, isAdmin, rateLimiter, editarPartida);
router.delete("/delete/:id_partida", authenticateToken, isAdmin, rateLimiter, deletarPartida);
router.patch("/agendar/:id_partida", authenticateToken, isAdmin, rateLimiter, agendar);
router.patch("/iniciar/:id_partida", authenticateToken, isAdmin, rateLimiter, iniciar);
router.patch("/resultado/:id_partida", authenticateToken, isAdmin, rateLimiter, registrarResultado);
router.patch("/vencedor/:id_partida", authenticateToken, isAdmin, rateLimiter, definirVencedor);
router.patch("/finalizar/:id_partida", authenticateToken, isAdmin, rateLimiter, finalizar);

export default router;
