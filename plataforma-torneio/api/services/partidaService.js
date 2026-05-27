import models from "../models/index.js";
import { atualizarPontuacaoService } from "./rankingService.js";

const { Partida, Torneio, Equipe, Usuario, PartidaUsuario } = models;

const FASES_VALIDAS = ["OITAVAS_DE_FINAL", "QUARTAS_DE_FINAL", "SEMI_FINAL", "FINAL"];
const STATUS_VALIDOS = ["PENDENTE", "EM_ANDAMENTO", "FINALIZADA"];
const FILTROS_PERMITIDOS = ["id_partida", "id_torneio", "fase", "status", "vencedor_id"];

const filtrarConsultaPartidas = (filtros = {}) => {
  const where = {};
  for (const campo of FILTROS_PERMITIDOS) {
    if (filtros[campo] !== undefined) where[campo] = filtros[campo];
  }
  return where;
};

const validarHorarioNoTorneio = async (id_torneio, horario, options = {}) => {
  const torneio = await Torneio.findByPk(id_torneio, options);
  if (!torneio) throw new Error("Torneio não encontrado");

  const dataHorario = new Date(horario);
  if (Number.isNaN(dataHorario.getTime())) throw new Error("Horário inválido");

  if (dataHorario < torneio.data_inicio || dataHorario > torneio.data_fim) {
    throw new Error(
      `Horário da partida deve estar entre ${torneio.data_inicio} e ${torneio.data_fim}`,
    );
  }

  return true;
};

export const createPartidaService = async (dados) => {
  const { id_torneio, fase, status = "PENDENTE", horario, equipes } = dados;

  if (!id_torneio) throw new Error("ID do torneio é obrigatório");
  if (!fase) throw new Error("Fase da partida é obrigatória");
  if (!FASES_VALIDAS.includes(fase)) throw new Error("Fase da partida é inválida");
  if (!STATUS_VALIDOS.includes(status)) throw new Error("Status da partida é inválido");
  if (status === "FINALIZADA") throw new Error("Partida não pode ser criada como finalizada");
  if (!Array.isArray(equipes) || equipes.length !== 2) {
    throw new Error("A partida deve ser criada com exatamente duas equipes");
  }
  if (equipes[0] === equipes[1]) {
    throw new Error("As equipes da partida devem ser diferentes");
  }

  const transaction = await models.sequelize.transaction();

  try {
    const torneio = await Torneio.findByPk(id_torneio, { transaction });
    if (!torneio) throw new Error("Torneio não encontrado");

    if (horario) {
      await validarHorarioNoTorneio(id_torneio, horario, { transaction });
    }

    const equipesEncontradas = await Equipe.findAll({
      where: { id_equipe: equipes },
      transaction,
    });

    if (equipesEncontradas.length !== 2) {
      throw new Error("Uma ou mais equipes não foram encontradas");
    }

    const equipeForaDoTorneio = equipesEncontradas.some(
      (equipe) => equipe.id_torneio !== id_torneio,
    );

    if (equipeForaDoTorneio) {
      throw new Error("Todas as equipes da partida devem pertencer ao torneio informado");
    }

    const novaPartida = await Partida.create(
      {
        id_torneio,
        fase,
        status,
        horario,
        placar: null,
        vencedor_id: null,
        resultado: null,
      },
      { transaction },
    );

    await PartidaUsuario.bulkCreate(
      equipes.map((id_equipe) => ({
        id_partida: novaPartida.id_partida,
        id_equipe,
      })),
      { transaction },
    );

    await transaction.commit();

    return {
      id_partida: novaPartida.id_partida,
      id_torneio: novaPartida.id_torneio,
      fase: novaPartida.fase,
      status: novaPartida.status,
      horario: novaPartida.horario,
      equipes,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getPartidaByIdService = async (id) => {
  const partida = await Partida.findByPk(id, {
    include: [
      {
        model: Torneio,
        attributes: ["nome", "categoria"],
      },
      {
        model: PartidaUsuario,
        as: "equipesPartida",
        include: [
          {
            model: Equipe,
            as: "equipe",
            attributes: ["id_equipe", "nome"],
            include: [
              {
                model: Usuario,
                as: "membros",
                attributes: ["id_usuario", "nome", "foto_perfil"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      },
    ],
  });

  if (!partida) throw new Error("Partida não encontrada");

  return {
    id_partida: partida.id_partida,
    id_torneio: partida.id_torneio,
    torneio: partida.Torneio
      ? {
          nome: partida.Torneio.nome,
          categoria: partida.Torneio.categoria,
        }
      : null,
    fase: partida.fase,
    status: partida.status,
    horario: partida.horario,
    placar: partida.placar,
    vencedor_id: partida.vencedor_id,
    resultado: partida.resultado,
    equipes: partida.equipesPartida.map((ep) => ({
      id_equipe: ep.equipe.id_equipe,
      nome: ep.equipe.nome,
      membros: ep.equipe.membros,
    })),
  };
};

export const getAllPartidasService = async (filtros = {}) => {
  const partidas = await Partida.findAll({
    where: filtrarConsultaPartidas(filtros),
    include: [
      {
        model: Torneio,
        attributes: ["nome"],
      },
      {
        model: PartidaUsuario,
        as: "equipesPartida",
        attributes: ["status_individual"],
        include: [
          {
            model: Equipe,
            as: "equipe",
            attributes: ["id_equipe", "nome"],
          },
        ],
      },
    ],
    order: [["horario", "ASC"]],
  });

  return partidas.map((p) => ({
    id_partida: p.id_partida,
    torneio: p.Torneio ? p.Torneio.nome : null,
    fase: p.fase,
    status: p.status,
    horario: p.horario,
    placar: p.placar,
    equipes: p.equipesPartida.map((ep) => ({
      id_equipe: ep.equipe.id_equipe,
      nome: ep.equipe.nome,
      status_individual: ep.status_individual,
    })),
  }));
};

export const updatePartidaService = async (id, dados) => {
  const partida = await Partida.findByPk(id);
  if (!partida) throw new Error("Partida não encontrada");

  const camposPermitidos = ["fase", "status", "horario", "placar", "resultado"];
  const dadosFiltrados = {};

  for (const campo of Object.keys(dados)) {
    if (!camposPermitidos.includes(campo)) {
      throw new Error(`Campo ${campo} não pode ser alterado por esta rota`);
    }
  }

  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) dadosFiltrados[campo] = dados[campo];
  }

  if (dadosFiltrados.fase && !FASES_VALIDAS.includes(dadosFiltrados.fase)) {
    throw new Error("Fase da partida é inválida");
  }

  if (dadosFiltrados.status && !STATUS_VALIDOS.includes(dadosFiltrados.status)) {
    throw new Error("Status da partida é inválido");
  }
  if (dadosFiltrados.status === "FINALIZADA") {
    throw new Error("Use a rota de finalização para encerrar uma partida");
  }

  if (dadosFiltrados.horario) {
    await validarHorarioNoTorneio(partida.id_torneio, dadosFiltrados.horario);
  }

  await partida.update(dadosFiltrados);

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
  const partida = await Partida.findByPk(id, {
    include: [{ model: PartidaUsuario, as: "equipesPartida" }],
  });
  if (!partida) throw new Error("Partida não encontrada");
  if (partida.equipesPartida.length !== 2) {
    throw new Error("A partida precisa ter exatamente duas equipes para ser iniciada");
  }

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
    horario: partida.horario || agora,
  });
  return {
    id_partida: partida.id_partida,
    status: partida.status,
    horario: partida.horario,
  };
};

export const finalizarPartidaService = async (id, dados) => {
  const { placar, vencedor_id, resultado } = dados;
  if (!vencedor_id) throw new Error("Vencedor obrigatório");

  const transaction = await models.sequelize.transaction();

  try {
    const partida = await Partida.findByPk(id, {
      include: [{ model: PartidaUsuario, as: "equipesPartida" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!partida) throw new Error("Partida não encontrada");
    if (partida.status === "FINALIZADA") throw new Error("Partida já finalizada");
    if (partida.status !== "EM_ANDAMENTO") {
      throw new Error("Apenas partidas em andamento podem ser finalizadas");
    }

    const equipesDaPartida = partida.equipesPartida.map((vinculo) => vinculo.id_equipe);
    if (!equipesDaPartida.includes(vencedor_id)) {
      throw new Error("Equipe vencedora não participa desta partida");
    }

    await partida.update(
      {
        placar: placar || partida.placar,
        vencedor_id,
        resultado: resultado || partida.resultado,
        status: "FINALIZADA",
      },
      { transaction },
    );

    const equipeVencedora = await Equipe.findByPk(vencedor_id, {
      include: [
        {
          model: Usuario,
          as: "membros",
          attributes: ["id_usuario"],
        },
      ],
      transaction,
    });

    if (!equipeVencedora) throw new Error("Equipe vencedora não encontrada");
    if (equipeVencedora.id_torneio !== partida.id_torneio) {
      throw new Error("Equipe vencedora não pertence ao torneio da partida");
    }

    let tipoEvento = null;
    if (partida.fase === "OITAVAS_DE_FINAL") tipoEvento = "AVANCO_FASE";
    if (partida.fase === "QUARTAS_DE_FINAL") tipoEvento = "AVANCO_FASE";
    if (partida.fase === "SEMI_FINAL") tipoEvento = "FINALISTA";
    if (partida.fase === "FINAL") tipoEvento = "CAMPEAO";

    if (tipoEvento) {
      for (const membro of equipeVencedora.membros) {
        await atualizarPontuacaoService(membro.id_usuario, tipoEvento, { transaction });
      }
    }

    await transaction.commit();

    return {
      id_partida: partida.id_partida,
      status: partida.status,
      placar: partida.placar,
      vencedor_id: partida.vencedor_id,
      resultado: partida.resultado,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
