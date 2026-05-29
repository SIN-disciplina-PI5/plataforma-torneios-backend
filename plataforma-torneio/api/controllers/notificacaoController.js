import models from "../models/index.js";
import { criarNotificacaoService } from "../services/notificacaoService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

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
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ erro: error.message });
  }
};

export const criarNotificacao = async (req, res) => {
  try {
    const nova = await criarNotificacaoService(req.body);
    res.status(201).json(nova);
  } catch (error) {
    console.error(error);
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ erro: error.message });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    const notificacao = await Notificacao.findOne({
      where: { id_notificacao: id, id_usuario },
    });

    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada" });
    }

    notificacao.lida = true;
    await notificacao.save();
    res.json(notificacao);
  } catch (error) {
    console.error(error);
    const statusCode = getStatusCodeByError(error.message);
    res.status(statusCode).json({ erro: error.message });
  }
};
