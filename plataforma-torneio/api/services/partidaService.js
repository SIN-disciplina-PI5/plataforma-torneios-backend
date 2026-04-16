import models from "../models/index.js";
const { Partida, Torneio } = models;

export const createPartidaService = async (dados) => {
  const { id_torneio, fase, status, horario } = dados;
  if (!id_torneio) throw new Error("ID do torneio é obrigatório");
  if (!fase) throw new Error("Fase da partida é obrigatória");
  if (!status) throw new Error("Status da partida é obrigatório");

  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");

  const novaPartida = await Partida.create({
    id_torneio, fase, status, horario,
    placar: null,
    vencedor_id: null,
    resultado: null
  });

  return {
    id_partida: novaPartida.id_partida,
    id_torneio: novaPartida.id_torneio,
    fase: novaPartida.fase,
    status: novaPartida.status,
    horario: novaPartida.horario,
  };
};

export const getPartidaByIdService = async (id) => {
  const partida = await Partida.findByPk(id, {
    include: [{ model: Torneio, attributes: ["nome", "categoria"] }]
  });
  if (!partida) throw new Error("Partida não encontrada");
  return {
    id_partida: partida.id_partida,
    id_torneio: partida.id_torneio,
    torneio: partida.Torneio ? partida.Torneio.nome : null,
    fase: partida.fase,
    status: partida.status,
    horario: partida.horario,
    placar: partida.placar,
    vencedor_id: partida.vencedor_id,
    resultado: partida.resultado,
  };
};

export const getAllPartidasService = async (filtros = {}) => {
  const partidas = await Partida.findAll({
    where: filtros,
    include: [{ model: Torneio, attributes: ["nome"] }],
    order: [["horario", "ASC"]]
  });
  return partidas.map(p => ({
    id_partida: p.id_partida,
    torneio: p.Torneio ? p.Torneio.nome : null,
    fase: p.fase,
    status: p.status,
    horario: p.horario,
    placar: p.placar,
  }));
};

export const updatePartidaService = async (id, dados) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  await partida.update(dados);
  return {
    id_partida: partida.id_partida,
    id_torneio: partida.id_torneio,
    fase: partida.fase,
    status: partida.status,
    horario: partida.horario,
    placar: partida.placar,
    vencedor_id: partida.vencedor_id,
    resultado: partida.resultado,
  };
};

export const deletePartidaService = async (id) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  await partida.destroy();
  return { message: "Partida deletada com sucesso" };
};

// Funções específicas
export const agendarPartidaService = async (id, horario) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  await partida.update({ horario, status: "PENDENTE" });
  return {
    id_partida: partida.id_partida,
    horario: partida.horario,
    status: partida.status,
  };
};

export const iniciarPartidaService = async (id) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  await partida.update({
    status: "EM_ANDAMENTO",
    horario: partida.horario || new Date()
  });
  return {
    id_partida: partida.id_partida,
    status: partida.status,
    horario: partida.horario,
  };
};

export const finalizarPartidaService = async (id, dados) => {
  const { placar, vencedor_id, resultado } = dados;
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  
  await partida.update({
    placar: placar || partida.placar,
    vencedor_id: vencedor_id || partida.vencedor_id,
    resultado: resultado || partida.resultado,
    status: "FINALIZADA"
  });
  
  return {
    id_partida: partida.id_partida,
    status: partida.status,
    placar: partida.placar,
    vencedor_id: partida.vencedor_id,
    resultado: partida.resultado,
  };
};