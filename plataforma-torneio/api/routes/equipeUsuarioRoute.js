import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import equipeUsuarioController  from "../controllers/equipeUsuarioController.js"


const router = Router();

router.get("/", equipeUsuarioController.getAllEquipeUsuarios);

router.get("/:equipeUsuarioId", authenticateToken, equipeUsuarioController.getEquipeUsuarioById);

router.post(
  "/",
  authenticateToken,
  equipeUsuarioController.createEquipeUsuario
);

router.put(
  "/:equipeUsuarioId",
  authenticateToken,
  equipeUsuarioController.updateEquipeUsuario
);

router.delete(
  "/:equipeUsuarioId",
  authenticateToken,
  equipeUsuarioController.deleteEquipeUsuario
);
export default router;
