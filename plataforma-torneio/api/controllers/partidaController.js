import {
  criarPartidaService,
  buscarPartidaService,
  listarPartidasService,
  editarPartidaService,
  deletarPartidaService,
  agendarPartidaService,
  iniciarPartidaService,
  registrarResultadoService,
  definirVencedorService,
  finalizarPartidaService
} from "../services/partidaService.js";

export const criarPartida = async (req, res) => {
  try {
    const result = await criarPartidaService(req.body);
    return res.status(201).json({ message: "Partida criada", data: result });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const buscarPartida = async (req, res) => {
  try {
    const partida = await buscarPartidaService(req.params.id_partida);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const listarPartidas = async (req, res) => {
  try {
    const partidas = await listarPartidasService(req.query);
    return res.status(200).json(partidas);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const editarPartida = async (req, res) => {
  try {
    const partida = await editarPartidaService(req.params.id_partida, req.body);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deletarPartida = async (req, res) => {
  try {
    await deletarPartidaService(req.params.id_partida);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const agendar = async (req, res) => {
  try {
    const { horario } = req.body;
    const partida = await agendarPartidaService(req.params.id_partida, horario);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const iniciar = async (req, res) => {
  try {
    const partida = await iniciarPartidaService(req.params.id_partida);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const registrarResultado = async (req, res) => {
  try {
    const { placar, resultado } = req.body;
    const partida = await registrarResultadoService(req.params.id_partida, placar, resultado);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const definirVencedor = async (req, res) => {
  try {
    const { vencedor_id } = req.body;
    const partida = await definirVencedorService(req.params.id_partida, vencedor_id);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const finalizar = async (req, res) => {
  try {
    const partida = await finalizarPartidaService(req.params.id_partida);
    return res.status(200).json(partida);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
