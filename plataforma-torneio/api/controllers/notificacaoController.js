import models from "../models/index.js";
const { Notificacao } = models;

export const listarNotificacoes = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const notificacoes = await Notificacao.findAll({
      where: { id_usuario },
      order: [["createdAt", "DESC"]],
    });
    res.json(notificacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar notificações" });
  }
};

export const criarNotificacao = async (req, res) => {
  try {
    const { titulo, mensagem, tipo } = req.body;
    const id_usuario = req.user.id;

    const nova = await Notificacao.create({
      id_usuario,
      titulo,
      mensagem,
      tipo,
    });
    res.status(201).json(nova);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar notificação" });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    const notificacao = await Notificacao.findOne({
      where: { id, id_usuario },
    });

    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada" });
    }

    notificacao.lida = true;
    await notificacao.save();
    res.json(notificacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar notificação" });
  }
};