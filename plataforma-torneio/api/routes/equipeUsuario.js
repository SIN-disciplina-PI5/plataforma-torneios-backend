import { Router } from "express";
import equipeUsuarioController  from "../controllers/equipeUsuarioController";
import { isAuthenticated, isResourceOwner } from "../middlewares/authenticateToken";

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
  eEquipeUsuario
);

router.delete(
  "/:equipeUsuarioId",
  isAuthenticated,
  isResourceOwner('EquipeUsuario'),
  equipeUsuarioController.deleteEquipeUsuario
);

export default router;

// necessário revisão do código acima