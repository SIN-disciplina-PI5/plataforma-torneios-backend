import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import checkAdmin from "../middlewares/checkAdmin.js";
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

router.post("/", authenticateToken, checkAdmin, rateLimiter, criarPartidaUsuario);
router.get("/", authenticateToken, listarPartidasUsuario);
router.get("/:id_partida_usuario", authenticateToken, buscarPartidaUsuario);
router.patch("/edit/:id_partida_usuario", authenticateToken, checkAdmin, rateLimiter, editarPartidaUsuario);
router.delete("/delete/:id_partida_usuario", authenticateToken, checkAdmin, rateLimiter, deletarPartidaUsuario);

router.post("/vincular/:id_partida", authenticateToken, checkAdmin, rateLimiter, vincularJogador);
router.patch("/resultado/:id_partida_usuario", authenticateToken, checkAdmin, rateLimiter, definirResultado);

export default router;