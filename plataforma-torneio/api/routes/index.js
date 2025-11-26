import { Router } from "express";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";
import adminRoute from "./adminRoute.js";
import equipeRoute from "./equipeRoute.js";
import equipeUsuarioRoute from "./equipeUsuarioRoute.js";


const router = Router();

router.use("/users", userRoute);
router.use("/torneio", torneioRoute);
router.use("/admin", adminRoute);
router.use("/equipe", equipeRoute);
router.use("/equipeUsuario", equipeUsuarioRoute);


export default router;
