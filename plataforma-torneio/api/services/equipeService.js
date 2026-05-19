import models from "../models/index.js";
const { Equipe, EquipeUsuario, Inscricao, Torneio, Usuario } = models;

export const createEquipeService = async (id_torneio, id_usuario, nome) => {
  if (!nome) throw new Error("Nome da equipe é obrigatório");

  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio, status: "APROVADA" }
  });
  if (!inscricao) throw new Error("Usuário precisa estar aprovado no torneio");

  const equipeJaExistente = await Equipe.findOne({
    include: [{
      model: Usuario,
      as: "membros",
      where: { id_usuario },
      through: { attributes: [] }
    }],
    where: { id_torneio }
  });
  if (equipeJaExistente) throw new Error("Usuário já possui equipe neste torneio");

  const equipeExistente = await Equipe.findOne({
    where: { nome, id_torneio }
  });
  if (equipeExistente) throw new Error("Já existe uma equipe com este nome neste torneio");

  const equipe = await Equipe.create({ nome, id_torneio });
  await EquipeUsuario.create({ id_equipe: equipe.id_equipe, id_usuario });

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome
  };
};

export const entrarNaEquipeService = async (id_torneio, id_usuario, id_equipe) => {
  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio, status: "APROVADA" }
  });
  if (!inscricao) throw new Error("Usuário precisa estar aprovado no torneio");

  const equipeJaExistente = await Equipe.findOne({
    include: [{
      model: Usuario,
      as: "membros",
      where: { id_usuario },
      through: { attributes: [] }
    }],
    where: { id_torneio }
  });
  if (equipeJaExistente) throw new Error("Usuário já possui uma equipe neste torneio");

  const equipe = await Equipe.findByPk(id_equipe, {
    include: [{ model: Usuario, as: "membros", attributes: ["id_usuario"] }]
  });
  if (!equipe) throw new Error("Equipe não encontrada");
  if (equipe.id_torneio !== id_torneio) throw new Error("Equipe não pertence a este torneio");
  if (equipe.membros.length >= 2) throw new Error("Equipe já está cheia");

  await EquipeUsuario.create({ id_equipe, id_usuario });
  return { message: "Usuário entrou na equipe" };
};

export const sairDaEquipeService = async (id_torneio, id_usuario) => {
  const inscricao = await Inscricao.findOne({
    where: {
      id_usuario,
      id_torneio
    }
  });
  if (!inscricao || !inscricao.id_equipe) throw new Error("Usuário não está em uma equipe");
  const equipe = await Equipe.findByPk(inscricao.id_equipe,{
    include:[
      {
        model: Usuario,
        as: "membros",
        attributes:["id_usuario"]
      }
    ]
  });

  if (!equipe) throw new Error("Equipe não encontrada");

  await EquipeUsuario.destroy({
    where: {
      id_usuario,
      id_equipe: equipe.id_equipe
    }
  });

  await inscricao.update({
    id_equipe: null
  });

  const equipeAtualizada = await Equipe.findByPk(equipe.id_equipe,{
    include:[
      {
        model: Usuario,
        as: "membros",
        attributes:["id_usuario"]
      }
    ]
  });

  if (!equipeAtualizada || equipeAtualizada.membros.length === 0) {
    await Equipe.destroy({
      where: {
        id_equipe: equipe.id_equipe
      }
    });
  }

  return {
    message: "Usuário saiu da equipe"
  };
};

export const getAllEquipesService = async (id_torneio) => {
  const equipes = await Equipe.findAll({
    where: {
      id_torneio
    },
    include:[
      {
        model: Usuario,
        as: "membros",
        attributes:["id_usuario","nome"],
        through:{ attributes:[] }
      }
    ]
  });

  return equipes.map(e => ({
    id_equipe: e.id_equipe,
    nome: e.nome,
    membros: e.membros,
    completa: e.membros.length === 2
  }));
};

export const getEquipeByIdService = async (id) => {
  const equipe = await Equipe.findByPk(id,{
    include:[
      {
        model: Usuario,
        as: "membros",
        attributes:["id_usuario","nome"],
        through:{ attributes:[] }
      }
    ]
  });
  if (!equipe) throw new Error("Equipe não encontrada");

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
    membros: equipe.membros,
    completa: equipe.membros.length === 2
  };
};

export const updateEquipeService = async (id, data) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  const dadosPermitidos = {};
  if (data.nome)
    dadosPermitidos.nome = data.nome;

  if (data.nome && data.nome !== equipe.nome) {
    const equipeExistente = await Equipe.findOne({
      where: {
        nome: data.nome,
        id_torneio: equipe.id_torneio
      }
    });
    if (equipeExistente) throw new Error("Já existe equipe com este nome");
  }

  await equipe.update(dadosPermitidos);

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome
  };
};

export const deleteEquipeService = async (id) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  await equipe.destroy();
  return {
    message: "Equipe deletada com sucesso"
  };
};