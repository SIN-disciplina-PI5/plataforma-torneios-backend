import models, { sequelize } from "../models/index.js";
import { sairDaEquipeService } from "./equipeService.js";
const { Inscricao, Torneio, Usuario } = models;

const podeAcessarInscricao = (inscricao, usuarioLogado = null) =>
  usuarioLogado?.role === "ADMIN" || usuarioLogado?.id === inscricao.id_usuario;

export const createInscricaoService = async (data) => {
  const { id_usuario, id_torneio } = data;

  if (!id_usuario) throw new Error("ID do usuário é obrigatório");
  if (!id_torneio) throw new Error("ID do torneio é obrigatório");

  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) throw new Error("Usuário não encontrado");

  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");
  if (!torneio.status) throw new Error("Torneio não está ativo para inscrições");

  const inscricaoExistente = await Inscricao.findOne({
    where: { id_usuario, id_torneio }
  });

  if (inscricaoExistente) {
    throw new Error("Usuário já está inscrito neste torneio");
  }

  const totalAprovadas = await Inscricao.count({
    where: { id_torneio, status: true }
  });

  if (totalAprovadas >= torneio.vagas) {
    throw new Error("Torneio está com todas as vagas preenchidas");
  }

  const inscricao = await Inscricao.create({
    id_usuario,
    id_torneio,
    status: true,
  });

  return {
    id_inscricao: inscricao.id_inscricao,
    id_usuario: inscricao.id_usuario,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status,
    data_inscricao: inscricao.data_inscricao,
  };
};

export const getAllInscricoesService = async () => {
  const inscricoes = await Inscricao.findAll({
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email"]
      },
      {
        model: Torneio,
        as: "torneio",
        attributes: ["id_torneio", "nome", "categoria"]
      }
    ],
    order: [["data_inscricao", "DESC"]]
  });

  return inscricoes.map(i => ({
    id_inscricao: i.id_inscricao,
    status: i.status,
    usuario: i.usuario
      ? { id: i.id_usuario, nome: i.usuario.nome, email: i.usuario.email }
      : { id: i.id_usuario },
    torneio: i.torneio
      ? { id: i.id_torneio, nome: i.torneio.nome, categoria: i.torneio.categoria }
      : { id: i.id_torneio },
    dupla: null,
    data_inscricao: i.data_inscricao,
  }));
};

export const getInscricaoByIdService = async (id, usuarioLogado = null) => {
  const inscricao = await Inscricao.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email"]
      },
      {
        model: Torneio,
        as: "torneio",
        attributes: ["id_torneio", "nome", "categoria", "vagas"]
      }
    ]
  });

  if (!inscricao) throw new Error("Inscrição não encontrada");
  if (!podeAcessarInscricao(inscricao, usuarioLogado)) throw new Error("Acesso negado");

  return {
    id_inscricao: inscricao.id_inscricao,
    status: inscricao.status,
    usuario: inscricao.usuario || { id: inscricao.id_usuario },
    torneio: inscricao.torneio || { id: inscricao.id_torneio },
    dupla: null,
    data_inscricao: inscricao.data_inscricao,
  };
};

export const updateInscricaoService = async (id, data, usuarioLogado) => {
  if (usuarioLogado?.role !== "ADMIN") {
    throw new Error("Apenas administradores podem atualizar inscrições");
  }

  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");

  if (typeof data.status !== 'boolean') {
    throw new Error("Status deve ser true (ativo) ou false (inativo)");
  }

  if (data.status === true && inscricao.status === false) {
    const torneio = await Torneio.findByPk(inscricao.id_torneio);
    const totalAtivas = await Inscricao.count({
      where: { id_torneio: inscricao.id_torneio, status: true }
    });
    if (totalAtivas >= torneio.vagas) {
      throw new Error("Não há vagas disponíveis para reativar esta inscrição");
    }
  }

  await inscricao.update({ status: data.status });

  return {
    id_inscricao: inscricao.id_inscricao,
    id_usuario: inscricao.id_usuario,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status,
    mensagem: data.status ? "Inscrição reativada" : "Inscrição cancelada pelo administrador"
  };
};

export const deleteInscricaoService = async (id, usuarioLogado = null) => {
  const inscricao = await Inscricao.findByPk(id);

  if (!inscricao) throw new Error("Inscrição não encontrada");
  if (!podeAcessarInscricao(inscricao, usuarioLogado)) throw new Error("Acesso negado");

  const equipe = await Equipe.findOne({
    where: { id_torneio: inscricao.id_torneio },
    include: [{
      model: Usuario,
      as: "membros",
      where: { id_usuario: inscricao.id_usuario },
      through: { attributes: [] }
    }]
  });

  if (equipe) {
    await sairDaEquipeService(
      inscricao.id_torneio,
      inscricao.id_usuario
    );
  }

  await inscricao.destroy();

  return { message: "Inscrição cancelada com sucesso" };
};

export const getInscricoesByTorneioService = async (id_torneio) => {
  const inscricoes = await Inscricao.findAll({
    where: { id_torneio },
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email", "patente"]
      }
    ],
    order: [["data_inscricao", "ASC"]]
  });

  return inscricoes;
};
