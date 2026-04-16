import { Router } from "express";
import {
  createInscricao,
  getAllInscricoes,
  getInscricaoById,
  updateInscricao,
  deleteInscricao,
  getInscricoesByTorneio
} from "../controllers/inscricaoController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.post("/", authenticateToken, createInscricao);
router.get("/", authenticateToken, checkAdmin, getAllInscricoes);
router.get("/torneio/:id_torneio", authenticateToken, getInscricoesByTorneio);
router.get("/:id_inscricao", authenticateToken, getInscricaoById);
router.patch("/:id_inscricao", authenticateToken, checkAdmin, updateInscricao);
router.delete("/:id_inscricao", authenticateToken, deleteInscricao);

export default router;