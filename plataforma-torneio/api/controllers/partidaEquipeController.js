import {
  createPartidaEquipeService,
  getPartidaEquipeByIdService,
  getAllPartidasEquipeService,
  updatePartidaEquipeService,
  deletePartidaEquipeService,
} from "../services/partidaEquipeService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const createPartidaEquipe = async (req, res) => {
  try {
    const result = await createPartidaEquipeService(req.body);
    return res.status(201).json({ message: "Vínculo criado", data: result });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getPartidaEquipeById = async (req, res) => {
  try {
    const vinculo = await getPartidaEquipeByIdService(req.params.id_partida_equipe);
    return res.status(200).json({ data: vinculo });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getAllPartidasEquipe = async (req, res) => {
  try {
    const vinculos = await getAllPartidasEquipeService(req.query);
    return res.status(200).json({ data: vinculos });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const updatePartidaEquipe = async (req, res) => {
  try {
    const vinculo = await updatePartidaEquipeService(req.params.id_partida_equipe, req.body);
    return res.status(200).json({ message: "Vínculo atualizado", data: vinculo });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const deletePartidaEquipe = async (req, res) => {
  try {
    await deletePartidaEquipeService(req.params.id_partida_equipe);
    return res.status(204).send();
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};