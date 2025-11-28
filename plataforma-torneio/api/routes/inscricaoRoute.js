import { Router } from "express";
import {
  createInscricao,
  getAllInscricoes,
  getInscricaoById,
  updateInscricao,
  deleteInscricao,
} from "../controllers/inscricaoController.js";

const router = Router();

// Criar uma nova inscrição
router.post("/", createInscricao);

// Buscar todas as inscrições
router.get("/", getAllInscricoes);

// Buscar inscrição por ID
router.get("/:id", getInscricaoById);

// Atualizar status da inscrição
router.put("/:id", updateInscricao);

// Deletar inscrição
router.delete("/:id", deleteInscricao);

export default router;
