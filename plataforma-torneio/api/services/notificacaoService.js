import models from "../models/index.js";
const { Notificacao } = models;

export const criarNotificacaoService = async ({ id_usuario, titulo, mensagem, tipo, }) => {
  if (!id_usuario || !titulo || !mensagem || !tipo) throw new Error("Dados inválidos para notificação");

  return await Notificacao.create({
    id_usuario,
    titulo,
    mensagem,
    tipo,
  });
};

export const notificarMembrosService = async (usuarios, titulo, mensagem, tipo) => {
  for (const id_usuario of usuarios) {
    await criarNotificacaoService({
      id_usuario,
      titulo,
      mensagem,
      tipo,
    });
  }
};