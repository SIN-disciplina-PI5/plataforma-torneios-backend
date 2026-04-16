import { Router } from "express";
import {
  createEquipe,
  getAllEquipes,
  getEquipeById,
  updateEquipe,
  deleteEquipe,
  entrarNaEquipe,
  sairDaEquipe
} from "../controllers/equipeController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.get("/", authenticateToken, getAllEquipes);
router.get("/:id", authenticateToken, getEquipeById);
router.post("/:id_torneio", authenticateToken, createEquipe);
router.post("/entrar/:id_torneio", authenticateToken, entrarNaEquipe);
router.post("/sair/:id_torneio", authenticateToken, sairDaEquipe);
router.put("/:id", authenticateToken, checkAdmin, updateEquipe);
router.delete("/:id", authenticateToken, checkAdmin, deleteEquipe);

export default router;