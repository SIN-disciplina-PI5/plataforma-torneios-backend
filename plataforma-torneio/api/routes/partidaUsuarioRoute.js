import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { isAdmin } from "../middlewares/authorize.js";
import {
  criarPartidaUsuario,
  buscarPartidaUsuario,
  listarPartidasUsuario,
  editarPartidaUsuario,
  deletarPartidaUsuario,
  vincularJogador,
  definirResultado
} from "../controllers/partidaUsuarioController.js";

const router = Router();

router.post("/", authenticateToken, isAdmin, rateLimiter, criarPartidaUsuario);
router.get("/", authenticateToken, listarPartidasUsuario);
router.get("/:id_partida_usuario", authenticateToken, buscarPartidaUsuario);
router.patch("/edit/:id_partida_usuario", authenticateToken, isAdmin, rateLimiter, editarPartidaUsuario);
router.delete("/delete/:id_partida_usuario", authenticateToken, isAdmin, rateLimiter, deletarPartidaUsuario);

router.post("/vincular/:id_partida", authenticateToken, isAdmin, rateLimiter, vincularJogador);
router.patch("/resultado/:id_partida_usuario", authenticateToken, isAdmin, rateLimiter, definirResultado);

export default router;