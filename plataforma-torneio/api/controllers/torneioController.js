import {
  createTorneioService,
  getAllTorneiosService,
  getTorneioByIdService,
  updateTorneioService,
  deleteTorneioService,
} from "../services/torneioService.js";

export const createTorneio = async (req, res) => {
  try {
    const novoTorneio = await createTorneioService(req.body);
    return res.status(201).json({
      message: "Torneio criado",
      data: novoTorneio,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const getAllTorneios = async (req, res) => {
  try {
    const torneios = await getAllTorneiosService();
    return res.status(200).json({ data: torneios });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getTorneioById = async (req, res) => {
  try {
    const torneio = await getTorneioByIdService(req.params.id_torneio);
    return res.status(200).json({ data: torneio });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const updateTorneio = async (req, res) => {
  try {
    const torneioAtualizado = await updateTorneioService(req.params.id_torneio, req.body);
    return res.status(200).json({
      message: "Torneio atualizado",
      data: torneioAtualizado,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deleteTorneio = async (req, res) => {
  try {
    await deleteTorneioService(req.params.id_torneio);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};