import "dotenv/config.js";
import {
  createInscricaoService,
  getAllInscricoesService,
  getInscricaoByIdService,
  updateInscricaoService,
  deleteInscricaoService,
} from "../services/inscricaoService.js";

export const createInscricao = async (req, res) => {
  try {
    const { id_equipe, id_torneio } = req.body;

    if (!id_equipe || !id_torneio) {
      return res.status(400).json({
        error: "id_equipe e id_torneio são obrigatórios",
      });
    }

    const newInscricao = await createInscricaoService({
      id_equipe,
      id_torneio,
    });

    return res.status(201).json({
      message: "Inscrição criada com sucesso",
      data: newInscricao,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const getAllInscricoes = async (req, res) => {
  try {
    const inscricoes = await getAllInscricoesService();
    return res.status(200).json({ data: inscricoes });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getInscricaoById = async (req, res) => {
  try {
    const inscricao = await getInscricaoByIdService(req.params.id);
    return res.status(200).json({ data: inscricao });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const updateInscricao = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["AGUARDANDO", "APROVADA", "REJEITADA"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const inscricaoAtualizada = await updateInscricaoService(req.params.id, {
      status,
    });

    return res.status(200).json({
      message: "Inscrição atualizada com sucesso",
      data: inscricaoAtualizada,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deleteInscricao = async (req, res) => {
  try {
    await deleteInscricaoService(req.params.id);
    return res.status(204).send();
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};
