import { Router } from "express";
import { isAuthenticated, isResourceOwner } from "../middlewares/authenticateToken";
import equipeUsuarioController  from "../controllers/equipeUsuarioController";

const router = Router();

// ??
router.get("/", equipeUsuarioController.getAllEquipeUsuarios);

router.get("/:equipeUsuarioId", equipeUsuarioController.getEquipeUsuarioById, isAuthenticated);

router.post(
  "/",
  isAuthenticated,
  equipeUsuarioController.createEquipeUsuario
);

router.put(
  "/:equipeUsuarioId",
  isAuthenticated,
  isResourceOwner('EquipeUsuario'),
  equipeUsuarioController.updateEquipeUsuario
);

router.delete(
  "/:equipeUsuarioId",
  isAuthenticated,
  isResourceOwner('EquipeUsuario'),
  equipeUsuarioController.deleteEquipeUsuario
);

export default router;

// necessário revisão do código acima