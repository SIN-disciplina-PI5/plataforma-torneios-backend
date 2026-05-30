import {
  createInscricaoService,
  getAllInscricoesService,
  getInscricaoByIdService,
  updateInscricaoService,
  deleteInscricaoService,
  getInscricoesByTorneioService,
} from "../services/inscricaoService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const createInscricao = async (req, res) => {
  try {
    const id_usuario =
      req.user.role === "ADMIN" && req.body.id_usuario
        ? req.body.id_usuario
        : req.user.id;
    const inscricao = await createInscricaoService({ ...req.body, id_usuario });
    res.status(201).json(inscricao);
  } catch (error) {
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ error: error.message });
  }
};

export const getAllInscricoes = async (req, res) => {
  try {
    const inscricoes = await getAllInscricoesService();
    res.status(200).json(inscricoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInscricaoById = async (req, res) => {
  try {
    const { id_inscricao } = req.params;
    const inscricao = await getInscricaoByIdService(id_inscricao, req.user);
    res.status(200).json(inscricao);
  } catch (error) {
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ error: error.message });
  }
};

export const updateInscricao = async (req, res) => {
  try {
    const { id_inscricao } = req.params;
    const inscricao = await updateInscricaoService(id_inscricao, req.body, req.user);
    res.status(200).json(inscricao);
  } catch (error) {
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ error: error.message });
  }
};

export const deleteInscricao = async (req, res) => {
  try {
    const { id_inscricao } = req.params;
    const result = await deleteInscricaoService(id_inscricao, req.user);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ error: error.message });
  }
};

export const getInscricoesByTorneio = async (req, res) => {
  try {
    const { id_torneio } = req.params;
    const inscricoes = await getInscricoesByTorneioService(id_torneio);
    res.status(200).json(inscricoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
