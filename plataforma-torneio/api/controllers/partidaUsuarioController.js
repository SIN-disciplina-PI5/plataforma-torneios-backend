import {
  createPartidaUsuarioService,
  getPartidaUsuarioByIdService,
  getAllPartidasUsuarioService,
  updatePartidaUsuarioService,
  deletePartidaUsuarioService,
  definirStatusIndividualService,
} from "../services/partidaUsuarioService.js";

export const createPartidaUsuario = async (req, res) => {
  try {
    const result = await createPartidaUsuarioService(req.body);
    return res.status(201).json({ message: "Vínculo criado", data: result });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const getPartidaUsuarioById = async (req, res) => {
  try {
    const vinculo = await getPartidaUsuarioByIdService(req.params.id_partida_usuario);
    return res.status(200).json({ data: vinculo });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const getAllPartidasUsuario = async (req, res) => {
  try {
    const vinculos = await getAllPartidasUsuarioService(req.query);
    return res.status(200).json({ data: vinculos });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const updatePartidaUsuario = async (req, res) => {
  try {
    const vinculo = await updatePartidaUsuarioService(req.params.id_partida_usuario, req.body);
    return res.status(200).json({ message: "Vínculo atualizado", data: vinculo });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deletePartidaUsuario = async (req, res) => {
  try {
    await deletePartidaUsuarioService(req.params.id_partida_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const definirStatusIndividual = async (req, res) => {
  try {
    const { status } = req.body;
    const vinculo = await definirStatusIndividualService(req.params.id_partida_usuario, status);
    return res.status(200).json({ message: "Status definido", data: vinculo });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};