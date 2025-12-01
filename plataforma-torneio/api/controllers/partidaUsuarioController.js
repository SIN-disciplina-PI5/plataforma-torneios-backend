import {
  criarPartidaUsuarioService,
  buscarPartidaUsuarioService,
  listarPartidasUsuarioService,
  editarPartidaUsuarioService,
  deletarPartidaUsuarioService,
  vincularJogadorService,
  definirResultadoService
} from "../services/partidaUsuarioService.js";

export const criarPartidaUsuario = async (req, res) => {
  try {
    const result = await criarPartidaUsuarioService(req.body);
    return res.status(201).json({ message: "Vínculo criado", data: result });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const buscarPartidaUsuario = async (req, res) => {
  try {
    const partidaUsuario = await buscarPartidaUsuarioService(req.params.id_partida_usuario);
    return res.status(200).json(partidaUsuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const listarPartidasUsuario = async (req, res) => {
  try {
    const partidasUsuario = await listarPartidasUsuarioService(req.query);
    return res.status(200).json(partidasUsuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const editarPartidaUsuario = async (req, res) => {
  try {
    const partidaUsuario = await editarPartidaUsuarioService(req.params.id_partida_usuario, req.body);
    return res.status(200).json(partidaUsuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deletarPartidaUsuario = async (req, res) => {
  try {
    await deletarPartidaUsuarioService(req.params.id_partida_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const vincularJogador = async (req, res) => {
  try {
    const { id_equipe } = req.body; 
    const vinculo = await vincularJogadorService(req.params.id_partida, id_equipe);
    return res.status(200).json(vinculo);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const definirResultado = async (req, res) => {
  try {
    const { status } = req.body;
    const partidaUsuario = await definirResultadoService(req.params.id_partida_usuario, status);
    return res.status(200).json(partidaUsuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};