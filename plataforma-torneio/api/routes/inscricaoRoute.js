import { Router } from "express";
import {
  createInscricao,
  getAllInscricoes,
  getInscricaoById,
  updateInscricao,
  deleteInscricao,
} from "../controllers/inscricaoController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

// Criar uma nova inscrição
router.post("/", authenticateToken, createInscricao);

// Buscar todas as inscrições
router.get("/", getAllInscricoes);

// Buscar inscrição por ID
router.get("/:id", getInscricaoById);

// Atualizar status da inscrição
router.put("/:id", authenticateToken, checkAdmin, updateInscricao);

// Deletar inscrição
router.delete("/:id", authenticateToken, checkAdmin, deleteInscricao);

export default router;
