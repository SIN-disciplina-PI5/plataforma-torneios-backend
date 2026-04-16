import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import {
  createEquipeUsuario,
  getAllEquipeUsuarios,
  getEquipeUsuarioById,
  deleteEquipeUsuario,
} from "../controllers/equipeUsuarioController.js";

const router = Router();

router.get("/", authenticateToken, getAllEquipeUsuarios);
router.get("/:id", authenticateToken, getEquipeUsuarioById); 
router.post("/", authenticateToken, createEquipeUsuario);
router.delete("/:id", authenticateToken, deleteEquipeUsuario);

export default router;