import {
  createEquipeUsuarioService,
  getAllEquipeUsuarioService,
  getEquipeUsuarioByIdService,
  deleteEquipeUsuarioService,
} from "../services/equipeUsuarioService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const createEquipeUsuario = async (req, res) => {
  try {
    const vinculo = await createEquipeUsuarioService({
      id_equipe: req.body.id_equipe,
      id_usuario: req.body.id_usuario,
    });
    return res.status(201).json({
      message: "Vínculo criado com sucesso",
      data: vinculo,
    });
  } catch (err) {
    const statusCode = getStatusCodeByError(err.message);
    return res.status(statusCode).json({ error: err.message });
  }
};

export const getAllEquipeUsuarios = async (req, res) => {
  try {
    const vinculos = await getAllEquipeUsuarioService();
    return res.status(200).json({
      results: vinculos.length,
      data: vinculos,
    });
  } catch (err) {
    const statusCode = getStatusCodeByError(err.message);
    return res.status(statusCode).json({ error: err.message });
  }
};

export const getEquipeUsuarioById = async (req, res) => {
  try {
    const vinculo = await getEquipeUsuarioByIdService(req.params.id);
    return res.status(200).json({ data: vinculo });
  } catch (err) {
    const statusCode = getStatusCodeByError(err.message);
    return res.status(statusCode).json({ error: err.message });
  }
};

export const deleteEquipeUsuario = async (req, res) => {
  try {
    await deleteEquipeUsuarioService(req.params.id);
    return res.status(204).send();
  } catch (err) {
    const statusCode = getStatusCodeByError(err.message);
    return res.status(statusCode).json({ error: err.message });
  }
};