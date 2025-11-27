import { criarTorneioService, listarTorneiosService, buscarTorneioService, atualizarTorneioService, deletarTorneioService,} from "../services/torneioService.js";

export const criarTorneio = async (req, res) => {
  try {
    const novoTorneio = await criarTorneioService(req.body);
    return res.status(201).json({ message: "Torneio criado", data: novoTorneio });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const listarTorneios = async (req, res) => {
  try {
    const torneios = await listarTorneiosService();
    return res.status(200).json(torneios);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const buscarTorneio = async (req, res) => {
  try {
    const torneio = await buscarTorneioService(req.params.id_torneio);
    return res.status(200).json(torneio);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const atualizarTorneio = async (req, res) => {
  try {
    const torneioAtualizado = await atualizarTorneioService(req.params.id_torneio, req.body);
    return res.status(200).json(torneioAtualizado);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deletarTorneio = async (req, res) => {
  try {
    await deletarTorneioService(req.params.id_torneio);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
