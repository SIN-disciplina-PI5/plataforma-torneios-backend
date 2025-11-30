import models from "../models/index.js";
const { Partida, Torneio, Equipe } = models;

export const criarPartidaService = async (dados) => {
  const { id_torneio, fase, status, horario } = dados;
  if (!id_torneio || !fase || !status) throw new Error("Dados faltando");

  const novaPartida = await Partida.create({
    id_torneio,
    fase,
    status,
    horario,
    placar: null,
    vencedor_id: null,
    resultado: null
  });

  return novaPartida;
};

export const buscarPartidaService = async (id) => {
  const partida = await Partida.findByPk(id, {
    include: [
      {
        model: Torneio,
        attributes: ['nome']
      }
    ]
  });
  if (!partida) throw new Error("Partida não encontrada");
  return partida;
};

export const listarPartidasService = async (filtros = {}) => {
  return await Partida.findAll({
    where: filtros,
    include: [
      {
        model: Torneio,
        attributes: ['nome']
      }
    ],
    order: [['horario', 'ASC']]
  });
};

export const editarPartidaService = async (id, dados) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  await partida.update(dados);
  return partida;
};

export const deletarPartidaService = async (id) => {
  const deletado = await Partida.destroy({ where: { id_partida: id } });
  if (!deletado) throw new Error("Partida não encontrada");
};

export const agendarPartidaService = async (id, horario) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  
  await partida.update({
    horario,
    status: 'PENDENTE'
  });
  
  return partida;
};

export const iniciarPartidaService = async (id) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  
  await partida.update({
    status: 'EM_ANDAMENTO',
    horario: partida.horario || new Date()
  });
  
  return partida;
};

export const registrarResultadoService = async (id, placar, resultado = null) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  
  await partida.update({
    placar,
    resultado,
    status: 'FINALIZADA'
  });
  
  return partida;
};

export const definirVencedorService = async (id, vencedor_id) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");

  const equipe = await Equipe.findByPk(vencedor_id);
  if (!equipe) throw new Error("Equipe não encontrada");

  await partida.update({
    vencedor_id,
    status: 'FINALIZADA'
  });
  
  return partida;
};

export const finalizarPartidaService = async (id) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  
  await partida.update({
    status: 'FINALIZADA'
  });
  
  return partida;
};
