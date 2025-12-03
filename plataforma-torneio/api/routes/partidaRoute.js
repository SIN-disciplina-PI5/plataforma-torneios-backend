import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import checkAdmin from "../middlewares/checkAdmin.js";
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

router.post("/", authenticateToken, checkAdmin, rateLimiter, criarPartida);
router.get("/", authenticateToken, listarPartidas);
router.get("/:id_partida", authenticateToken, buscarPartida);
router.patch("/edit/:id_partida", authenticateToken, checkAdmin, rateLimiter, editarPartida);
router.delete("/delete/:id_partida", authenticateToken, checkAdmin, rateLimiter, deletarPartida);
router.patch("/agendar/:id_partida", authenticateToken, checkAdmin, rateLimiter, agendar);
router.patch("/iniciar/:id_partida", authenticateToken, checkAdmin, rateLimiter, iniciar);
router.patch("/resultado/:id_partida", authenticateToken, checkAdmin, rateLimiter, registrarResultado);
router.patch("/vencedor/:id_partida", authenticateToken, checkAdmin, rateLimiter, definirVencedor);
router.patch("/finalizar/:id_partida", authenticateToken, checkAdmin, rateLimiter, finalizar);

export default router;
