import {
  createPartidaUsuarioService,
  getPartidaUsuarioByIdService,
  getAllPartidasUsuarioService,
  updatePartidaUsuarioService,
  deletePartidaUsuarioService,
} from "../services/partidaUsuarioService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const createPartidaUsuario = async (req, res) => {
  try {
    const result = await createPartidaUsuarioService(req.body);
    return res.status(201).json({ message: "Vínculo criado", data: result });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getPartidaUsuarioById = async (req, res) => {
  try {
    const vinculo = await getPartidaUsuarioByIdService(req.params.id_partida_usuario);
    return res.status(200).json({ data: vinculo });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const getAllPartidasUsuario = async (req, res) => {
  try {
    const vinculos = await getAllPartidasUsuarioService(req.query);
    return res.status(200).json({ data: vinculos });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const updatePartidaUsuario = async (req, res) => {
  try {
    const vinculo = await updatePartidaUsuarioService(req.params.id_partida_usuario, req.body);
    return res.status(200).json({ message: "Vínculo atualizado", data: vinculo });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const deletePartidaUsuario = async (req, res) => {
  try {
    await deletePartidaUsuarioService(req.params.id_partida_usuario);
    return res.status(204).send();
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};