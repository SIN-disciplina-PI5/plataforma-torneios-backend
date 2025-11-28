import { Router } from "express";
import equipeController from "../controllers/equipeController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

// Rota GET (Listar) - Pode ser pública ou protegida
router.get("/", equipeController.getAllEquipes);
router.get("/:id", equipeController.getEquipeById);

// Rotas de Modificação - DEVEM ser protegidas
router.post("/", authenticateToken, equipeController.createEquipe);
router.put("/:id", authenticateToken, equipeController.updateEquipe);
router.delete("/:id", authenticateToken, equipeController.deleteEquipe);

export default router;
