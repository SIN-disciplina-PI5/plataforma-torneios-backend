import models from "../models/index.js";
const { Equipe, Usuario, EquipeUsuario, Inscricao } = models;

export const createEquipeService = async (id_torneio, id_usuario, nome) => {
  if (!nome) throw new Error("Nome da equipe é obrigatório");

  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio, status: "APROVADA" }
  });

  if (!inscricao) throw new Error("Usuário precisa estar aprovado no torneio");
  if (inscricao.id_equipe) throw new Error("Usuário já possui equipe");

  const equipeExistente = await Equipe.findOne({
    where: { nome, id_torneio }
  });

  if (equipeExistente) throw new Error("Já existe uma equipe com este nome neste torneio");

  const equipe = await Equipe.create({ nome, id_torneio });

  await EquipeUsuario.create({
    id_equipe: equipe.id_equipe,
    id_usuario
  });

  await inscricao.update({ id_equipe: equipe.id_equipe });

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
  };
};

export const entrarNaEquipeService = async (id_torneio, id_usuario, id_equipe) => {
  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio, status: "APROVADA" }
  });

  if (!inscricao) throw new Error("Usuário precisa estar aprovado no torneio");
  if (inscricao.id_equipe) throw new Error("Usuário já possui equipe");

  const equipe = await Equipe.findOne({
    where: { id_equipe, id_torneio }
  });

  if (!equipe) throw new Error("Equipe não encontrada");

  const membros = await EquipeUsuario.count({
    where: { id_equipe }
  });

  if (membros >= 2) throw new Error("Equipe já está cheia");

  await EquipeUsuario.create({
    id_equipe,
    id_usuario
  });

  await inscricao.update({ id_equipe });

  return { message: "Usuário entrou na equipe" };
};

export const sairDaEquipeService = async (id_torneio, id_usuario) => {
  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio }
  });

  if (!inscricao || !inscricao.id_equipe) {
    throw new Error("Usuário não está em uma equipe");
  }

  const id_equipe = inscricao.id_equipe;

  await EquipeUsuario.destroy({
    where: { id_usuario, id_equipe }
  });

  await inscricao.update({ id_equipe: null });

  return { message: "Usuário saiu da equipe" };
};

export const getAllEquipesService = async (id_torneio) => {
  const equipes = await Equipe.findAll({
    where: { id_torneio },
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario", "nome"],
        through: { attributes: [] }
      }
    ]
  });

  return equipes
    .filter(e => e.membros.length < 2)
    .map(e => ({
      id_equipe: e.id_equipe,
      nome: e.nome,
      membros: e.membros
    }));
};

export const getEquipeByIdService = async (id) => {
  const equipe = await Equipe.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario", "nome"],
        through: { attributes: [] }
      }
    ]
  });

  if (!equipe) throw new Error("Equipe não encontrada");

  return equipe;
};

export const updateEquipeService = async (id, data) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");

  await equipe.update(data);

  return equipe;
};

export const deleteEquipeService = async (id) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");

  await equipe.destroy();
  return { message: "Equipe deletada com sucesso" };
};