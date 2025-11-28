import { Router } from "express";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";
import inscricaoRoute from "./inscricaoRoute.js";
import equipeRoute from "./equipeRoute.js";
import adminRoute from "./adminRoute.js";

const router = Router();

router.use("/users", userRoute);
router.use("/torneio", torneioRoute);
router.use("/inscricoes", inscricaoRoute);
router.use("/equipe", equipeRoute);
router.use("/admin", adminRoute);

export default router;
