import {
  createPartidaService,
  getPartidaByIdService,
  getAllPartidasService,
  updatePartidaService,
  deletePartidaService,
  agendarPartidaService,
  iniciarPartidaService,
  finalizarPartidaService,
} from "../services/partidaService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const createPartida = async (req, res) => {
  try {
    const result = await createPartidaService(req.body);
    return res.status(201).json({ message: "Partida criada", data: result });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getPartidaById = async (req, res) => {
  try {
    const partida = await getPartidaByIdService(req.params.id_partida);
    return res.status(200).json({ data: partida });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getAllPartidas = async (req, res) => {
  try {
    const partidas = await getAllPartidasService(req.query);
    return res.status(200).json({ data: partidas });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const updatePartida = async (req, res) => {
  try {
    const partida = await updatePartidaService(req.params.id_partida, req.body);
    return res.status(200).json({ message: "Partida atualizada", data: partida });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const deletePartida = async (req, res) => {
  try {
    await deletePartidaService(req.params.id_partida);
    return res.status(204).send();
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const agendar = async (req, res) => {
  try {
    const { horario } = req.body;
    const partida = await agendarPartidaService(req.params.id_partida, horario);
    return res.status(200).json({ message: "Partida agendada", data: partida });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const iniciar = async (req, res) => {
  try {
    const partida = await iniciarPartidaService(req.params.id_partida);
    return res.status(200).json({ message: "Partida iniciada", data: partida });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const finalizar = async (req, res) => {
  try {
    const partida = await finalizarPartidaService(req.params.id_partida, req.body);
    return res.status(200).json({ message: "Partida finalizada", data: partida });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};