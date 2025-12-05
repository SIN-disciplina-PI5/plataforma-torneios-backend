import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminMe,
} from "../controllers/adminController.js";
import { logout } from "../controllers/authController.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.patch("/edit/:id_usuario", checkAdmin, updateAdmin);
router.delete("/delete/:id_usuario", checkAdmin, deleteAdmin);
router.post("/logout", checkAdmin, logout);
router.get("/me", checkAdmin, getAdminMe);

export default router;
