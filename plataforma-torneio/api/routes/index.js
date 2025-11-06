import { Router } from "express";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";

const router = Router();

router.use("/users", userRoute);
router.use("/torneio", torneioRoute);

export default router;