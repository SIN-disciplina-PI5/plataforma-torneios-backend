import models from "../models/index.js";
import { atualizarPontuacaoService } from "./rankingService.js";

const { Partida, Torneio, Equipe, Usuario, PartidaUsuario } = models;

const ORDEM_FASES = {
  OITAVAS_DE_FINAL: 1,
  QUARTAS_DE_FINAL: 2,
  SEMI_FINAL: 3,
  FINAL: 4,
};

const FASES_VALIDAS = ["OITAVAS_DE_FINAL", "QUARTAS_DE_FINAL", "SEMI_FINAL", "FINAL"];
const STATUS_VALIDOS = ["PENDENTE", "EM_ANDAMENTO", "FINALIZADA"];
const FILTROS_PERMITIDOS = ["id_partida", "id_torneio", "fase", "status", "vencedor_id"];

const fasesPorVagas = (vagas) => {
  const tamanho = Number(vagas);
  if (tamanho === 4) return ["SEMI_FINAL", "FINAL"];
  if (tamanho === 8) return ["QUARTAS_DE_FINAL", "SEMI_FINAL", "FINAL"];
  return ["OITAVAS_DE_FINAL", "QUARTAS_DE_FINAL", "SEMI_FINAL", "FINAL"];
};

const getFaseInicialPorVagas = (vagas) => {
  if (Number(vagas) === 4) return "SEMI_FINAL";
  if (Number(vagas) === 8) return "QUARTAS_DE_FINAL";
  return "OITAVAS_DE_FINAL";
};

const getFaseAtualTorneio = (torneio, partidasExistentes) => {
  if (torneio.fase_atual) return torneio.fase_atual;

  if (!partidasExistentes || partidasExistentes.length === 0) return null;

  return partidasExistentes.reduce((maior, partida) => {
    return ORDEM_FASES[partida.fase] > ORDEM_FASES[maior] ? partida.fase : maior;
  }, partidasExistentes[0].fase);
};

const obterMaxPartidasPorFase = (vagas, fase) => {
  const fases = fasesPorVagas(vagas);
  const indice = fases.indexOf(fase);
  if (indice === -1) return null;
  return Number(vagas) / 2 ** (indice + 1);
};

const obterEquipesEliminadas = async (id_torneio, equipes, transaction) => {
  const participacoesFinalizadas = await PartidaUsuario.findAll({
    where: { id_equipe: equipes },
    include: [
      {
        model: Partida,
        as: "partida",
        where: {
          id_torneio,
          status: "FINALIZADA",
        },
        attributes: ["vencedor_id"],
      },
    ],
    transaction,
  });

  return participacoesFinalizadas
    .filter((vinculo) => vinculo.partida && vinculo.partida.vencedor_id !== vinculo.id_equipe)
    .map((vinculo) => vinculo.id_equipe);
};

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

    const faseInicialEsperada = getFaseInicialPorVagas(torneio.vagas);

    const partidasExistentes = await Partida.findAll({
      where: {
        id_torneio,
      },
      attributes: ["fase", "status"],
      transaction,
    });

    const faseAtualTorneio = getFaseAtualTorneio(torneio, partidasExistentes);
    const novaFaseOrdinal = ORDEM_FASES[fase];

    if (!faseAtualTorneio) {
      if (fase !== faseInicialEsperada) {
        throw new Error(
          `Fase inicial esperada para este torneio é ${faseInicialEsperada}. Não é possível criar ${fase} neste momento`,
        );
      }
    } else {
      if (fase !== faseAtualTorneio) {
        throw new Error(
          `Só é permitido criar partidas na fase atual do torneio: ${faseAtualTorneio}`,
        );
      }

      const maiorFaseExistente = partidasExistentes.reduce((maior, partida) => {
        return ORDEM_FASES[partida.fase] > ORDEM_FASES[maior] ? partida.fase : maior;
      }, partidasExistentes[0].fase);

      const maiorFaseOrdinal = ORDEM_FASES[maiorFaseExistente];

      if (novaFaseOrdinal < maiorFaseOrdinal) {
        throw new Error(
          `Não é possível criar partidas em fases anteriores. Fase atual implícita: ${maiorFaseExistente}`,
        );
      }

      if (novaFaseOrdinal > maiorFaseOrdinal + 1) {
        throw new Error(
          `Não é possível pular fases. Fase atual implícita: ${maiorFaseExistente}. Próxima esperada: ${
            Object.entries(ORDEM_FASES).find(([_, v]) => v === maiorFaseOrdinal + 1)?.[0] || "NENHUMA"
          }`,
        );
      }

      if (novaFaseOrdinal > maiorFaseOrdinal) {
        const partidasNaoFinalizadas = await Partida.count({
          where: {
            id_torneio,
            fase: maiorFaseExistente,
            status: {
              [models.sequelize.Op.ne]: "FINALIZADA",
            },
          },
          transaction,
        });

        if (partidasNaoFinalizadas > 0) {
          throw new Error(
            `Ainda existem partidas não finalizadas na fase de ${maiorFaseExistente.replace(/_/g, " ")}`,
          );
        }
      }
    }

    if (!torneio.fase_atual) {
      const faseAtualParaAtualizar = faseAtualTorneio || fase;
      await torneio.update({ fase_atual: faseAtualParaAtualizar }, { transaction });
    }

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

    const equipesEliminadas = await obterEquipesEliminadas(
      id_torneio,
      equipes,
      transaction,
    );

    if (equipesEliminadas.length > 0) {
      throw new Error(
        "Equipes eliminadas não podem ser usadas em novas partidas: " +
          equipesEliminadas.join(", "),
      );
    }

    const participacoesNaFase = await PartidaUsuario.findAll({
      where: { id_equipe: equipes },
      include: [
        {
          model: Partida,
          as: "partida",
          where: {
            id_torneio,
            fase,
          },
          attributes: ["id_partida"],
        },
      ],
      transaction,
    });

    if (participacoesNaFase.length > 0) {
      const equipesDuplicadas = participacoesNaFase.map((vinculo) => vinculo.id_equipe);
      throw new Error(
        "Equipes já possuem partida nesta fase: " +
          [...new Set(equipesDuplicadas)].join(", "),
      );
    }

    const totalPartidasNaFase = await Partida.count({
      where: {
        id_torneio,
        fase,
      },
      transaction,
    });

    const maxPartidas = obterMaxPartidasPorFase(torneio.vagas, fase);
    if (maxPartidas !== null && totalPartidasNaFase >= maxPartidas) {
      throw new Error(
        `Não é possível criar mais partidas em ${fase.replace(/_/g, " ")}. Máximo permitido: ${maxPartidas}`,
      );
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
  const partida = await Partida.findOne({
    where: {
      id_partida: id,
    },
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
  const where = {
    ...filtrarConsultaPartidas(filtros),
  };

  const partidas = await Partida.findAll({
    where,
    include: [
      {
        model: Torneio,
        attributes: ["nome"],
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
      membros: ep.equipe.membros,
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

  if (dadosFiltrados.fase) {
    if (!FASES_VALIDAS.includes(dadosFiltrados.fase)) {
      throw new Error("Fase da partida é inválida");
    }

    if (dadosFiltrados.fase !== partida.fase) {
      throw new Error(
        "Não é possível alterar a fase de uma partida manualmente. Delete e recrie a partida na fase correta",
      );
    }
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

  // Proteção: não permite deletar partidas finalizadas
  if (partida.status === "FINALIZADA") {
    throw new Error("Não é possível deletar partidas finalizadas");
  }

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
    const partida = await Partida.findOne({
      where: { id_partida: id },
      include: [{ model: PartidaUsuario, as: "equipesPartida", required: true }],
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

    const placarFinal = placar !== undefined ? placar : partida.placar;
    if (!placarFinal) {
      throw new Error("Placar obrigatório para finalizar a partida");
    }

    await partida.update(
      {
        placar: placarFinal,
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
