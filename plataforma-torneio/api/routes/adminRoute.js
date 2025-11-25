import { Router } from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

const router = Router();

// Endpoint: POST /api/admin/register
router.post("/register", registerAdmin);

// Endpoint: POST /api/admin/login
router.post("/login", loginAdmin);

export default router;
