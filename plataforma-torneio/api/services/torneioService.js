import models from "../models/index.js";
const { Torneio } = models;

export const createTorneioService = async (dados) => {
  const { nome, categoria, vagas } = dados;
  if (!nome) throw new Error("Nome do torneio é obrigatório");
  if (!categoria) throw new Error("Categoria é obrigatória");
  if (!vagas) throw new Error("Número de vagas é obrigatório");

  const torneioExistente = await Torneio.findOne({ where: { nome } });
  if (torneioExistente) throw new Error("Já existe um torneio com este nome");

  const novoTorneio = await Torneio.create({
    nome,
    categoria,
    vagas,
    status: true, 
  });

  return {
    id_torneio: novoTorneio.id_torneio,
    nome: novoTorneio.nome,
    categoria: novoTorneio.categoria,
    vagas: novoTorneio.vagas,
    status: novoTorneio.status,
  };
};

export const getAllTorneiosService = async () => {
  const torneios = await Torneio.findAll({
    order: [["nome", "ASC"]]
  });
  return torneios.map(t => ({
    id_torneio: t.id_torneio,
    nome: t.nome,
    categoria: t.categoria,
    vagas: t.vagas,
    status: t.status,
  }));
};

export const getTorneioByIdService = async (id) => {
  const torneio = await Torneio.findByPk(id);
  if (!torneio) throw new Error("Torneio não encontrado");
  return {
    id_torneio: torneio.id_torneio,
    nome: torneio.nome,
    categoria: torneio.categoria,
    vagas: torneio.vagas,
    status: torneio.status,
  };
};

export const updateTorneioService = async (id, dados) => {
  const torneio = await Torneio.findByPk(id);
  if (!torneio) throw new Error("Torneio não encontrado");

  if (dados.nome && dados.nome !== torneio.nome) {
    const torneioExistente = await Torneio.findOne({ where: { nome: dados.nome } });
    if (torneioExistente) throw new Error("Já existe um torneio com este nome");
  }

  await torneio.update(dados);
  return {
    id_torneio: torneio.id_torneio,
    nome: torneio.nome,
    categoria: torneio.categoria,
    vagas: torneio.vagas,
    status: torneio.status,
  };
};

export const deleteTorneioService = async (id) => {
  const torneio = await Torneio.findByPk(id);
  if (!torneio) throw new Error("Torneio não encontrado");
  await torneio.destroy();
  return { message: "Torneio deletado com sucesso" };
};