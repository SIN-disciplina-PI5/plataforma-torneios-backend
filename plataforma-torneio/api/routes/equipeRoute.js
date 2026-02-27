import { Router } from "express";
import {
  createEquipe,
  getAllEquipes,
  getEquipeById,
  updateEquipe,
  deleteEquipe,
} from "../controllers/equipeController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.get("/", getAllEquipes);
router.get("/:id", getEquipeById);

router.post("/", authenticateToken, createEquipe);
router.put("/:id", authenticateToken, updateEquipe);
router.delete("/:id", authenticateToken, deleteEquipe);

export default router;