import { Router } from "express";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";
import inscricaoRoute from "./inscricaoRoute.js";

const router = Router();

router.use("/users", userRoute);
router.use("/torneio", torneioRoute);
router.use("/inscricoes", inscricaoRoute);

export default router;
