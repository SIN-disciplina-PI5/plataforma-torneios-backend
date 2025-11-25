import { Router } from "express";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";
import adminRoute from "./adminRoute.js";

const router = Router();

router.use("/users", userRoute);
router.use("/torneio", torneioRoute);
router.use("/admin", adminRoute);

export default router;
