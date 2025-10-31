import "dotenv/config.js";
import models from "../models/index.js";
const { Inscricao, Torneio, Equipe } = models;

export const createInscricao = async (req, res) => {
  try {
    const { id_equipe, id_torneio } = req.body;
    if (!id_equipe || !id_torneio) {
      return res
        .status(400)
        .json({ error: "Dados faltando para realizar a inscrição" });
    }
    const equipe = await Equipe.findByPk(id_equipe);
    const torneio = await Torneio.findByPk(id_torneio);

    if (!equipe || !torneio) {
      return res
        .status(404)
        .json({ error: "Equipe ou Torneio não encontrados" });
    }
    const inscricaoExistente = await Inscricao.findOne({
      where: { id_equipe, id_torneio },
    });

    if (inscricaoExistente) {
      return res.status(400).json({
        error: "Essa equipe já está inscrita neste torneio",
      });
    }

    const newInscricao = await Inscricao.create({
      id_equipe,
      id_torneio,
    });
    return res
      .status(201)
      .json({ message: "Inscrição criada com sucesso", data: newInscricao });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e.message || "Erro ao criar inscrição" });
  }
};

export const getAllInscricoes = async (req, res) => {
  try {
    const inscricoes = await Inscricao.findAll();
    return res.status(200).json({ data: inscricoes });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Erro ao buscar inscrições" });
  }
};

export const getInscricaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const inscricao = await Inscricao.findByPk(id);
    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    return res.status(200).json({ data: inscricao });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Erro ao buscar inscrição" });
  }
};

export const updateInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inscricao = await Inscricao.findByPk(id);
    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    await inscricao.update({ status });
    return res
      .status(200)
      .json({ message: "Inscrição atualizada com sucesso", data: inscricao });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Erro ao atualizar inscrição" });
  }
};

export const deleteInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    const inscricao = await Inscricao.findByPk(id);
    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    await inscricao.destroy();
    return res.status(204).send();
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Erro ao deletar inscrição" });
  }
};
