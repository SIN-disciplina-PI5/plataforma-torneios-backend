import { Router } from "express";
import { criarTorneio, listarTorneios, buscarTorneio, atualizarTorneio, deletarTorneio,} from "../controllers/torneioController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/", authenticateToken, criarTorneio);
router.get("/", listarTorneios);
router.get("/:id_torneio", buscarTorneio);
router.patch("/:id_torneio", authenticateToken, atualizarTorneio);
router.delete("/:id_torneio", authenticateToken, deletarTorneio);

export default router;