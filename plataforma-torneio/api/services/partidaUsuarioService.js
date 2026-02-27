import models from "../models/index.js";
const { PartidaUsuario, Partida, Equipe } = models;

export const createPartidaUsuarioService = async (dados) => {
  const { id_partida, id_equipe } = dados;
  if (!id_partida) throw new Error("ID da partida é obrigatório");
  if (!id_equipe) throw new Error("ID da equipe é obrigatório");

  const partida = await Partida.findByPk(id_partida);
  if (!partida) throw new Error("Partida não encontrada");

  const equipe = await Equipe.findByPk(id_equipe);
  if (!equipe) throw new Error("Equipe não encontrada");

  const vinculoExistente = await PartidaUsuario.findOne({
    where: { id_partida, id_equipe }
  });
  if (vinculoExistente) throw new Error("Equipe já vinculada a esta partida");

  const vinculo = await PartidaUsuario.create({ id_partida, id_equipe });
  return {
    id_partida_usuario: vinculo.id_partida_usuario,
    id_partida: vinculo.id_partida,
    id_equipe: vinculo.id_equipe,
    status_individual: vinculo.status_individual,
  };
};

export const getPartidaUsuarioByIdService = async (id) => {
  const vinculo = await PartidaUsuario.findByPk(id, {
    include: [
      { model: Partida, as: "partida", attributes: ["fase", "status", "horario"] },
      { model: Equipe, as: "equipe", attributes: ["nome"] }
    ]
  });
  if (!vinculo) throw new Error("Vínculo não encontrado");

  return {
    id_partida_usuario: vinculo.id_partida_usuario,
    partida: vinculo.partida || { id: vinculo.id_partida },
    equipe: vinculo.equipe || { id: vinculo.id_equipe },
    status_individual: vinculo.status_individual,
  };
};

export const getAllPartidasUsuarioService = async (filtros = {}) => {
  const vinculos = await PartidaUsuario.findAll({
    where: filtros,
    include: [
      { model: Partida, as: "partida", attributes: ["fase", "status", "horario"] },
      { model: Equipe, as: "equipe", attributes: ["nome"] }
    ]
  });

  return vinculos.map(v => ({
    id_partida_usuario: v.id_partida_usuario,
    partida: v.partida ? { id: v.id_partida, fase: v.partida.fase } : { id: v.id_partida },
    equipe: v.equipe ? { id: v.id_equipe, nome: v.equipe.nome } : { id: v.id_equipe },
    status_individual: v.status_individual,
  }));
};

export const updatePartidaUsuarioService = async (id, dados) => {
  const vinculo = await PartidaUsuario.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  await vinculo.update(dados);
  return {
    id_partida_usuario: vinculo.id_partida_usuario,
    id_partida: vinculo.id_partida,
    id_equipe: vinculo.id_equipe,
    status_individual: vinculo.status_individual,
  };
};

export const deletePartidaUsuarioService = async (id) => {
  const vinculo = await PartidaUsuario.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  await vinculo.destroy();
  return { message: "Vínculo removido com sucesso" };
};

export const definirStatusIndividualService = async (id, status) => {
  if (!status) throw new Error("Status é obrigatório");
  const vinculo = await PartidaUsuario.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  await vinculo.update({ status_individual: status });
  return {
    id_partida_usuario: vinculo.id_partida_usuario,
    status_individual: vinculo.status_individual,
  };
};