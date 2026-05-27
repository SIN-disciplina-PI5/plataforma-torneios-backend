import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import {
  createEquipeUsuario,
  getAllEquipeUsuarios,
  getEquipeUsuarioById,
  deleteEquipeUsuario,
} from "../controllers/equipeUsuarioController.js";

const router = Router();

router.get("/", authenticateToken, checkAdmin, getAllEquipeUsuarios);
router.get("/:id", authenticateToken, checkAdmin, getEquipeUsuarioById);
router.post("/", authenticateToken, checkAdmin, createEquipeUsuario);
router.delete("/:id", authenticateToken, checkAdmin, deleteEquipeUsuario);

export default router;