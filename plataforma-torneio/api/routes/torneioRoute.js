import { Router } from "express";
import {
  createTorneio,
  getAllTorneios,
  getTorneioById,
  updateTorneio,
  deleteTorneio,
} from "../controllers/torneioController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.post("/", authenticateToken, checkAdmin, createTorneio);
router.get("/", authenticateToken, getAllTorneios);
router.get("/:id_torneio", authenticateToken, getTorneioById);
router.patch("/:id_torneio", authenticateToken, checkAdmin, updateTorneio);
router.delete("/:id_torneio", authenticateToken, checkAdmin, deleteTorneio);

export default router;