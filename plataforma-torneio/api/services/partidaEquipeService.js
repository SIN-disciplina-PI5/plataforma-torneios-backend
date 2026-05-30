import models from "../models/index.js";

const { PartidaEquipe, Partida, Equipe } = models;
const FILTROS_PERMITIDOS = ["id_partida_equipe", "id_partida", "id_equipe"];

const filtrarConsulta = (filtros = {}) => {
  const where = {};
  for (const campo of FILTROS_PERMITIDOS) {
    if (filtros[campo] !== undefined) where[campo] = filtros[campo];
  }
  return where;
};

export const createPartidaEquipeService = async (dados) => {
  const { id_partida, id_equipe } = dados;
  if (!id_partida) throw new Error("ID da partida é obrigatório");
  if (!id_equipe) throw new Error("ID da equipe é obrigatório");

  const partida = await Partida.findByPk(id_partida);
  if (!partida) throw new Error("Partida não encontrada");

  const equipe = await Equipe.findByPk(id_equipe);
  if (!equipe) throw new Error("Equipe não encontrada");
  if (equipe.id_torneio !== partida.id_torneio) {
    throw new Error("Equipe e partida devem pertencer ao mesmo torneio");
  }

  const totalEquipes = await PartidaEquipe.count({ where: { id_partida } });
  if (totalEquipes >= 2) throw new Error("Partida já possui duas equipes");

  const vinculoExistente = await PartidaEquipe.findOne({
    where: { id_partida, id_equipe },
  });
  if (vinculoExistente) throw new Error("Equipe já vinculada a esta partida");

  const vinculo = await PartidaEquipe.create({ id_partida, id_equipe });
  return {
    id_partida_equipe: vinculo.id_partida_equipe,
    id_partida: vinculo.id_partida,
    id_equipe: vinculo.id_equipe,
  };
};

export const getPartidaEquipeByIdService = async (id) => {
  const vinculo = await PartidaEquipe.findByPk(id, {
    include: [
      { model: Partida, as: "partida", attributes: ["fase", "status", "horario"] },
      { model: Equipe, as: "equipe", attributes: ["nome"] },
    ],
  });
  if (!vinculo) throw new Error("Vínculo não encontrado");

  return {
    id_partida_equipe: vinculo.id_partida_equipe,
    partida: vinculo.partida || { id: vinculo.id_partida },
    equipe: vinculo.equipe || { id: vinculo.id_equipe },
  };
};

export const getAllPartidasEquipeService = async (filtros = {}) => {
  const vinculos = await PartidaEquipe.findAll({
    where: filtrarConsulta(filtros),
    include: [
      { model: Partida, as: "partida", attributes: ["fase", "status", "horario"] },
      { model: Equipe, as: "equipe", attributes: ["nome"] },
    ],
  });

  return vinculos.map((v) => ({
    id_partida_equipe: v.id_partida_equipe,
    partida: v.partida ? { id: v.id_partida, fase: v.partida.fase } : { id: v.id_partida },
    equipe: v.equipe ? { id: v.id_equipe, nome: v.equipe.nome } : { id: v.id_equipe },
  }));
};

export const updatePartidaEquipeService = async (id, dados) => {
  const vinculo = await PartidaEquipe.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");

  const dadosPermitidos = {};
  await vinculo.update(dadosPermitidos);
  return {
    id_partida_equipe: vinculo.id_partida_equipe,
    id_partida: vinculo.id_partida,
    id_equipe: vinculo.id_equipe,
  };
};

export const deletePartidaEquipeService = async (id) => {
  const vinculo = await PartidaEquipe.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  await vinculo.destroy();
  return { message: "Vínculo removido com sucesso" };
};


