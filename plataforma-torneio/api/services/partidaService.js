import models from "../models/index.js";
const { Partida, Torneio, Equipe, Usuario } = models;
import { atualizarPontuacaoService } from "./rankingService.js";

//função auxiliar para validar horário 
const validarHorarioNoTorneio = async (id_torneio, horario) => {
  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");
  const dataHorario = new Date(horario);
  if (dataHorario < torneio.data_inicio || dataHorario > torneio.data_fim) {
    throw new Error(`Horário da partida deve estar entre ${torneio.data_inicio} e ${torneio.data_fim}`);
  }
  return true;
};

export const createPartidaService = async (dados) => {
  const { id_torneio, fase, status, horario } = dados;
  if (!id_torneio) throw new Error("ID do torneio é obrigatório");
  if (!fase) throw new Error("Fase da partida é obrigatória");
  if (!status) throw new Error("Status da partida é obrigatório");

  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");

  if (horario) {
    await validarHorarioNoTorneio(id_torneio, horario);
  }

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

  if (dados.horario) {
    await validarHorarioNoTorneio(partida.id_torneio, dados.horario);
  }

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

export const agendarPartidaService = async (id, horario) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");
  if (!horario) throw new Error("Horário obrigatório");

  await validarHorarioNoTorneio(partida.id_torneio, horario);

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

  const torneio = await Torneio.findByPk(partida.id_torneio);
  const agora = new Date();
  if (agora < torneio.data_inicio) {
    throw new Error("O torneio ainda não começou");
  }
  if (agora > torneio.data_fim) {
    throw new Error("O torneio já terminou");
  }

  await partida.update({
    status: "EM_ANDAMENTO",
    horario: partida.horario || agora
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
  if (!vencedor_id) throw new Error("Vencedor obrigatório");

  await partida.update({
    placar: placar || partida.placar,
    vencedor_id,
    resultado: resultado || partida.resultado,
    status: "FINALIZADA"
  });

  const equipeVencedora = await Equipe.findByPk(vencedor_id,{
    include:[
      {
        model: Usuario,
        as: "membros",
        attributes:["id_usuario"]
      }
    ]
  });

  if (!equipeVencedora) throw new Error("Equipe vencedora não encontrada");
  let tipoEvento = null;
  if (partida.fase === "OITAVAS_DE_FINAL")
    tipoEvento = "AVANCO_FASE";
  if (partida.fase === "QUARTAS_DE_FINAL")
    tipoEvento = "AVANCO_FASE";
  if (partida.fase === "SEMI_FINAL")
    tipoEvento = "FINALISTA";
  if (partida.fase === "FINAL")
    tipoEvento = "CAMPEAO";

  if (tipoEvento){
    for (const membro of equipeVencedora.membros){
      await atualizarPontuacaoService(
        membro.id_usuario,
        tipoEvento
      );
    }
  }

  return {
    id_partida: partida.id_partida,
    status: partida.status,
    placar: partida.placar,
    vencedor_id: partida.vencedor_id,
    resultado: partida.resultado
  };
};