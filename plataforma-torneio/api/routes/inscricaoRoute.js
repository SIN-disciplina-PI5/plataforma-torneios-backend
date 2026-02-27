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

router.post("/", authenticateToken, createInscricao);
router.get("/", getAllInscricoes);
router.get("/:id", getInscricaoById);
router.put("/:id", authenticateToken, checkAdmin, updateInscricao);
router.delete("/:id", authenticateToken, checkAdmin, deleteInscricao);

export default router;