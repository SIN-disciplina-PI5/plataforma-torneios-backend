import models from "../models/index.js";
const { Equipe } = models;

export const createEquipeService = async (data) => {
  const { nome } = data;
  if (!nome) throw new Error("Nome da equipe é obrigatório");

  const equipeExistente = await Equipe.findOne({ where: { nome } });
  if (equipeExistente) throw new Error("Já existe uma equipe com este nome");

  const novaEquipe = await Equipe.create({ nome });
  return {
    id_equipe: novaEquipe.id_equipe,
    nome: novaEquipe.nome,
  };
};

export const getAllEquipesService = async () => {
  const equipes = await Equipe.findAll({
    order: [["nome", "ASC"]]
  });
  return equipes.map(e => ({
    id_equipe: e.id_equipe,
    nome: e.nome,
  }));
};

export const getEquipeByIdService = async (id) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
  };
};

export const updateEquipeService = async (id, data) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");

  if (data.nome && data.nome !== equipe.nome) {
    const equipeExistente = await Equipe.findOne({ where: { nome: data.nome } });
    if (equipeExistente) throw new Error("Já existe uma equipe com este nome");
  }

  await equipe.update(data);
  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
  };
};

export const deleteEquipeService = async (id) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  await equipe.destroy();
  return { message: "Equipe deletada com sucesso" };
};