import models from "../models/index.js";
import { normalizarTextoObrigatorio } from "../utils/validation.js";
const { Notificacao } = models;

export const criarNotificacaoService = async ({ id_usuario, titulo, mensagem, tipo, }) => {
  if (!id_usuario) throw new Error("Usuário é obrigatório");
  titulo = normalizarTextoObrigatorio(titulo, "Título");
  mensagem = normalizarTextoObrigatorio(mensagem, "Mensagem");
  tipo = normalizarTextoObrigatorio(tipo, "Tipo");

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
