import { Router } from "express";
import docsRoute from "./docsRoute.js";
import userRoute from "./userRoute.js";
import torneioRoute from "./torneioRoute.js";
import inscricaoRoute from "./inscricaoRoute.js";
import equipeRoute from "./equipeRoute.js";
import equipeUsuarioRoute from "./equipeUsuarioRoute.js";
import rankingRoute from "./rankingRoute.js";
import partidaRoute from "./partidaRoute.js";
import partidaEquipeRoute from "./partidaEquipeRoute.js";
import resetPasswordRoute from "./resetPasswordRoute.js";
import notificacaoRoutes from "./notificacaoRouter.js";

const router = Router();

router.use("/docs", docsRoute);
router.use("/users", userRoute);
router.use("/torneio", torneioRoute);
router.use("/inscricoes", inscricaoRoute);
router.use("/equipe", equipeRoute);
router.use("/equipe-usuarios", equipeUsuarioRoute);
router.use("/ranking", rankingRoute);
router.use("/partidas", partidaRoute);
router.use("/partida-equipes", partidaEquipeRoute);
router.use("/password", resetPasswordRoute);
router.use("/notifications", notificacaoRoutes);

export default router;
