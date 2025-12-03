import { Router } from "express";
import { criarTorneio, listarTorneios, buscarTorneio, atualizarTorneio, deletarTorneio,} from "../controllers/torneioController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.post("/", authenticateToken, checkAdmin, criarTorneio);
router.get("/", authenticateToken, checkAdmin, listarTorneios);
router.get("/:id_torneio", authenticateToken, checkAdmin, buscarTorneio);
router.patch("/:id_torneio", authenticateToken, checkAdmin, atualizarTorneio);
router.delete("/:id_torneio", authenticateToken,  checkAdmin, deletarTorneio);

export default router;