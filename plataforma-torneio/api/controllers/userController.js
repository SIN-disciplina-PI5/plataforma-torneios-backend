import { criarUsuarioService, editarUsuarioService, getAllUsuariosService, getUsuarioByIdService, deletarUsuarioService, visualizarHistoricoService, visualizarRankingService } from "../services/userService.js";

export const criarUsuario = async (req, res) => {
  try {
    const result = await criarUsuarioService(req.body);
    return res.status(201).json({ message: "Usuário criado", data: result });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const editarPerfil = async (req, res) => {
  try {
    const usuario = await editarUsuarioService(req.params.id_usuario, req.body);
    return res.status(200).json(usuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await getAllUsuariosService();
    return res.status(200).json({ data: usuarios });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const usuario = await getUsuarioByIdService(req.params.id_usuario);
    return res.status(200).json({ data: usuario });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const deletarPerfil = async (req, res) => {
  try {
    await deletarUsuarioService(req.params.id_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const visualizarHistorico = async (req, res) => {
  try {
    const historico = await visualizarHistoricoService(req.user.id); 
    return res.status(200).json(historico);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const visualizarRanking = async (req, res) => {
  try {
    const ranking = await visualizarRankingService();
    return res.status(200).json(ranking);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
