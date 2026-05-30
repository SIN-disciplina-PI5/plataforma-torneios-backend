import models from "../models/index.js";
import { Op } from "sequelize";
import {
  normalizarTextoObrigatorio,
  normalizarTextoOpcional,
} from "../utils/validation.js";
import { notificarMembrosService } from "./notificacaoService.js";

const {
  Torneio,
  Inscricao,
  Partida,
  PartidaEquipe,
  Equipe,
  EquipeUsuario,
  Usuario,
  sequelize,
} = models;

const DURACAO_PARTIDA_MINUTOS = 30;

export const obterHorarioInicioReal = (torneio) => {
  const horario = new Date(torneio.data_inicio);

  switch (String(torneio.turno)) {
    case "MANHA":
      horario.setHours(8, 0, 0, 0);
      break;
    case "TARDE":
      horario.setHours(13, 0, 0, 0);
      break;
    case "NOITE":
      horario.setHours(18, 0, 0, 0);
      break;
  }

  return horario;
};

const calcularTempoMinimoTorneio = (vagas) => {
  const totalPartidas = Number(vagas) / 2 - 1;
  return totalPartidas * DURACAO_PARTIDA_MINUTOS;
};

export const createTorneioService = async (dados) => {
  const nome = normalizarTextoObrigatorio(dados.nome, "Nome do torneio");
  const categoria = normalizarTextoObrigatorio(dados.categoria, "Categoria");
  const { vagas, data_inicio, data_fim } = dados;
  const turno = dados.turno;

  const valoresTurno = ["MANHA", "TARDE", "NOITE"];
  if (!turno) throw new Error("Turno é obrigatório");
  if (!valoresTurno.includes(String(turno))) throw new Error("Turno inválido");

  if (!vagas) throw new Error("Número de vagas é obrigatório");
  if (!data_inicio) throw new Error("Data de início é obrigatória");
  if (!data_fim) throw new Error("Data de fim é obrigatória");

  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);

  if (isNaN(inicio) || isNaN(fim)) throw new Error("Datas inválidas");
  if (fim <= inicio) {
    throw new Error("Data de fim deve ser posterior à data de início");
  }

  const vagasValidas = [4, 8, 16, 32];
  if (!vagasValidas.includes(Number(vagas))) {
    throw new Error("As vagas devem ser 4, 8, 16 ou 32");
  }

  const diferencaMinutos = (fim - inicio) / 60000;
  const tempoMinimo = calcularTempoMinimoTorneio(vagas);

  if (diferencaMinutos < tempoMinimo) {
    throw new Error(
      `O torneio precisa ter pelo menos ${tempoMinimo} minutos para ${vagas} usuários`,
    );
  }

  const torneioExistente = await Torneio.findOne({
    where: { nome },
  });

  if (torneioExistente) throw new Error("Já existe um torneio com este nome");

  const novoTorneio = await Torneio.create({
    nome,
    categoria,
    vagas,
    status: true,
    data_inicio: inicio,
    data_fim: fim,
    turno: String(turno),
  });

  return {
    id_torneio: novoTorneio.id_torneio,
    nome: novoTorneio.nome,
    categoria: novoTorneio.categoria,
    vagas: novoTorneio.vagas,
    status: novoTorneio.status,
    data_inicio: novoTorneio.data_inicio,
    data_fim: novoTorneio.data_fim,
    turno: novoTorneio.turno,
    fase_atual: novoTorneio.fase_atual,
  };
};

export const getAllTorneiosService = async () => {
  const torneios = await Torneio.findAll({ order: [["nome", "ASC"]] });

  return torneios.map((t) => ({
    id_torneio: t.id_torneio,
    nome: t.nome,
    categoria: t.categoria,
    vagas: t.vagas,
    status: t.status,
    data_inicio: t.data_inicio,
    data_fim: t.data_fim,
    turno: t.turno,
    fase_atual: t.fase_atual,
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
    data_inicio: torneio.data_inicio,
    data_fim: torneio.data_fim,
    turno: torneio.turno,
    fase_atual: torneio.fase_atual,
  };
};

export const updateTorneioService = async (id, dados) => {
  const torneio = await Torneio.findByPk(id);

  if (!torneio) throw new Error("Torneio não encontrado");

  if (dados.nome !== undefined) {
    dados.nome = normalizarTextoOpcional(dados.nome, "Nome do torneio");
  }

  if (dados.categoria !== undefined) {
    dados.categoria = normalizarTextoOpcional(dados.categoria, "Categoria");
  }

  if (dados.vagas !== undefined) {
    const vagasValidas = [4, 8, 16, 32];

    if (!vagasValidas.includes(Number(dados.vagas))) {
      throw new Error("As vagas devem ser 4, 8, 16 ou 32");
    }
  }

  if (dados.turno !== undefined) {
    const valoresTurno = ["MANHA", "TARDE", "NOITE"];
    if (!valoresTurno.includes(String(dados.turno)))
      throw new Error("Turno inválido");
  }

  const vagasFinais = dados.vagas ?? torneio.vagas;

  if (dados.data_inicio || dados.data_fim || dados.vagas) {
    const inicio = dados.data_inicio
      ? new Date(dados.data_inicio)
      : torneio.data_inicio;
    const fim = dados.data_fim ? new Date(dados.data_fim) : torneio.data_fim;

    if (isNaN(inicio) || isNaN(fim)) throw new Error("Datas inválidas");
    if (fim <= inicio) {
      throw new Error("Data de fim deve ser posterior à data de início");
    }

    const diferencaMinutos = (fim - inicio) / 60000;
    const tempoMinimo = calcularTempoMinimoTorneio(vagasFinais);

    if (diferencaMinutos < tempoMinimo) {
      throw new Error(
        `O torneio precisa ter pelo menos ${tempoMinimo} minutos para ${vagasFinais} usuários`,
      );
    }

    dados.data_inicio = inicio;
    dados.data_fim = fim;
  }

  if (dados.nome && dados.nome !== torneio.nome) {
    const torneioExistente = await Torneio.findOne({
      where: { nome: dados.nome },
    });

    if (torneioExistente) throw new Error("Já existe um torneio com este nome");
  }

  await torneio.update(dados);

  return {
    id_torneio: torneio.id_torneio,
    nome: torneio.nome,
    categoria: torneio.categoria,
    vagas: torneio.vagas,
    status: torneio.status,
    data_inicio: torneio.data_inicio,
    data_fim: torneio.data_fim,
    turno: torneio.turno,
    fase_atual: torneio.fase_atual,
  };
};

export const deleteTorneioService = async (id) => {
  const torneio = await Torneio.findByPk(id);

  if (!torneio) throw new Error("Torneio não encontrado");

  await torneio.destroy();

  return { message: "Torneio deletado com sucesso" };
};

export const gerarChaveService = async (id_torneio) => {
  const transaction = await sequelize.transaction();

  try {
    const torneio = await Torneio.findByPk(id_torneio, { transaction });

    if (!torneio) throw new Error("Torneio não encontrado");
    const horarioInicioReal = obterHorarioInicioReal(torneio);

    if (new Date() < horarioInicioReal) {
      throw new Error("A chave só pode ser gerada após o início do torneio");
    }

    const partidasExistentes = await Partida.findOne({
      where: { id_torneio },
      transaction,
    });

    if (partidasExistentes) throw new Error("A chave do torneio já foi gerada");

    const equipesBrutas = await Equipe.findAll({
      where: { id_torneio },
      include: [
        {
          model: Usuario,
          as: "membros",
          attributes: ["id_usuario"],
          through: { attributes: [] },
          required: true,
          include: [
            {
              model: Inscricao,
              as: "inscricoes",
              attributes: [],
              where: {
                id_torneio,
                status: true,
              },
              required: true,
            },
          ],
        },
      ],
      transaction,
    });

    if (equipesBrutas.length < 2) {
      throw new Error("Não há equipes suficientes para gerar chave");
    }

    const { equipes, soloRestante } = await resolverEquipesSoltas(
      equipesBrutas,
      transaction,
    );

    const tamanhosValidos = [2, 4, 8, 16];

    if (soloRestante) {
      const idsUsuarios = soloRestante.membros.map((m) => m.id_usuario);

      if (!tamanhosValidos.includes(equipes.length)) {
        throw new Error("O torneio não pode começar com essa equipe sobrando");
      }

      await notificarMembrosService(
        idsUsuarios,
        "Equipe removida",
        "Sua equipe ficou com apenas 1 membro e foi removida do torneio",
        "EQUIPE",
      );

      await Equipe.destroy({
        where: {
          id_equipe: soloRestante.id_equipe,
        },
        transaction,
      });
    }

    if (!tamanhosValidos.includes(equipes.length)) {
      throw new Error("Número inválido de equipes após resolução de solos");
    }

    const embaralhadas = equipes.sort(() => Math.random() - 0.5);
    const idsPartidasCriadas = [];

    let horarioAtual = new Date(torneio.data_inicio);

    if (torneio.turno) {
      switch (String(torneio.turno)) {
        case "MANHA":
          horarioAtual.setHours(8, 0, 0, 0);
          break;
        case "TARDE":
          horarioAtual.setHours(13, 0, 0, 0);
          break;
        case "NOITE":
          horarioAtual.setHours(18, 0, 0, 0);
          break;
        default:
          break;
      }
    }

    const totalPartidas = embaralhadas.length / 2;

    const ultimoHorario = new Date(
      horarioAtual.getTime() +
        (totalPartidas - 1) * DURACAO_PARTIDA_MINUTOS * 60000,
    );

    if (ultimoHorario > torneio.data_fim) {
      throw new Error(
        "O intervalo do torneio é insuficiente para agendar as partidas",
      );
    }

    let faseInicial = null;
    if (equipes.length === 2) faseInicial = "FINAL";
    if (equipes.length === 4) faseInicial = "SEMI_FINAL";
    if (equipes.length === 8) faseInicial = "QUARTAS_DE_FINAL";
    if (equipes.length === 16) faseInicial = "OITAVAS_DE_FINAL";

    if (!faseInicial) {
      throw new Error("Número de equipes inválido para definir a fase inicial");
    }

    for (let i = 0; i < embaralhadas.length; i += 2) {
      const partida = await Partida.create(
        {
          id_torneio,
          fase: faseInicial,
          status: "PENDENTE",
          horario: new Date(horarioAtual),
        },
        { transaction },
      );

      await PartidaEquipe.bulkCreate(
        [
          {
            id_partida: partida.id_partida,
            id_equipe: embaralhadas[i].id_equipe,
          },
          {
            id_partida: partida.id_partida,
            id_equipe: embaralhadas[i + 1].id_equipe,
          },
        ],
        { transaction },
      );

      idsPartidasCriadas.push(partida.id_partida);

      horarioAtual = new Date(
        horarioAtual.getTime() + DURACAO_PARTIDA_MINUTOS * 60000,
      );
    }

    await torneio.update({ fase_atual: faseInicial }, { transaction });

    const partidasComEquipes = await Partida.findAll({
      where: { id_partida: idsPartidasCriadas },
      include: [{ model: PartidaEquipe, as: "equipesPartida", required: true }],
      transaction,
    });

    await transaction.commit();
    return partidasComEquipes;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const avancarFaseService = async (id_torneio) => {
  const transaction = await sequelize.transaction();

  try {
    const torneio = await Torneio.findByPk(id_torneio, { transaction });
    if (!torneio) throw new Error("Torneio não encontrado");
    if (!torneio.fase_atual) {
      throw new Error("Nenhuma partida foi gerada para este torneio ainda.");
    }

    const faseAtual = torneio.fase_atual;

    const partidasNaFase = await Partida.count({
      where: {
        id_torneio,
        fase: faseAtual,
      },
      transaction,
    });

    if (partidasNaFase === 0) {
      throw new Error(
        `Não há partidas geradas na fase atual: ${faseAtual.replace(/_/g, " ")}`,
      );
    }

    const partidasPendentes = await Partida.count({
      where: {
        id_torneio,
        fase: faseAtual,
        status: {
          [Op.ne]: "FINALIZADA",
        },
      },
      transaction,
    });

    if (partidasPendentes > 0) {
      throw new Error(
        `Ainda existem partidas não finalizadas na fase de ${faseAtual.replace(/_/g, " ")}`,
      );
    }

    const mapaFases = {
      OITAVAS_DE_FINAL: "QUARTAS_DE_FINAL",
      QUARTAS_DE_FINAL: "SEMI_FINAL",
      SEMI_FINAL: "FINAL",
    };

    const proximaFase = mapaFases[faseAtual];

    if (!proximaFase) {
      throw new Error("O torneio já chegou na fase final ou foi concluído");
    }

    const partidasProximaFase = await Partida.findOne({
      where: {
        id_torneio,
        fase: proximaFase,
      },
      transaction,
    });

    if (partidasProximaFase) {
      throw new Error("A próxima fase já foi gerada");
    }

    const partidas = await Partida.findAll({
      where: {
        id_torneio,
        fase: faseAtual,
        status: "FINALIZADA",
      },
      order: [["horario", "ASC"]],
      transaction,
    });

    const vencedores = partidas.map((p) => {
      if (!p.vencedor_id) {
        throw new Error("Existem partidas sem vencedor definido");
      }

      return p.vencedor_id;
    });

    if (vencedores.length % 2 !== 0) {
      throw new Error(
        "Número inválido de vencedores para formar os próximos confrontos",
      );
    }

    const ultimaPartidaDaFase = await Partida.findOne({
      where: {
        id_torneio,
        fase: faseAtual,
      },
      order: [["horario", "DESC"]],
      transaction,
    });

    if (!ultimaPartidaDaFase) {
      throw new Error(
        "Não foi possível determinar o último horário da fase atual",
      );
    }

    let horarioAtual = new Date(
      new Date(ultimaPartidaDaFase.horario).getTime() +
        DURACAO_PARTIDA_MINUTOS * 60000,
    );

    const totalNovasPartidas = vencedores.length / 2;

    const ultimoHorario = new Date(
      horarioAtual.getTime() +
        (totalNovasPartidas - 1) * DURACAO_PARTIDA_MINUTOS * 60000,
    );

    if (ultimoHorario > torneio.data_fim) {
      throw new Error(
        "O intervalo do torneio é insuficiente para avançar a fase",
      );
    }

    const idsNovasPartidas = [];

    for (let i = 0; i < vencedores.length; i += 2) {
      const partida = await Partida.create(
        {
          id_torneio,
          fase: proximaFase,
          status: "PENDENTE",
          horario: new Date(horarioAtual),
        },
        { transaction },
      );

      await PartidaEquipe.bulkCreate(
        [
          {
            id_partida: partida.id_partida,
            id_equipe: vencedores[i],
          },
          {
            id_partida: partida.id_partida,
            id_equipe: vencedores[i + 1],
          },
        ],
        { transaction },
      );

      idsNovasPartidas.push(partida.id_partida);

      horarioAtual = new Date(
        horarioAtual.getTime() + DURACAO_PARTIDA_MINUTOS * 60000,
      );
    }

    await torneio.update({ fase_atual: proximaFase }, { transaction });

    const novasPartidasComEquipes = await Partida.findAll({
      where: { id_partida: idsNovasPartidas },
      include: [{ model: PartidaEquipe, as: "equipesPartida", required: true }],
      transaction,
    });

    await transaction.commit();
    return novasPartidasComEquipes;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const atualizarStatusService = async (id_torneio, status) => {
  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");

  await torneio.update({ status });

  return {
    id_torneio: torneio.id_torneio,
    nome: torneio.nome,
    categoria: torneio.categoria,
    vagas: torneio.vagas,
    status: torneio.status,
    data_inicio: torneio.data_inicio,
    data_fim: torneio.data_fim,
    fase_atual: torneio.fase_atual,
  };
};

const resolverEquipesSoltas = async (equipes, transaction) => {
  const full = equipes.filter((e) => e.membros.length === 2);
  let solos = equipes.filter((e) => e.membros.length === 1);
  const result = [...full];

  while (solos.length > 1) {
    const e1 = solos.pop();
    const e2 = solos.pop();

    const membroE2 = e2.membros[0];

    await EquipeUsuario.create(
      {
        id_equipe: e1.id_equipe,
        id_usuario: membroE2.id_usuario,
      },
      { transaction },
    );

    await notificarMembrosService(
      e1.membros.map((m) => m.id_usuario),
      "Equipe completada",
      "Um novo membro entrou na sua equipe",
      "EQUIPE",
    );

    await notificarMembrosService(
      [membroE2.id_usuario],
      "Equipe completada",
      "Sua equipe foi mesclada automaticamente",
      "EQUIPE",
    );

    await Equipe.destroy({
      where: {
        id_equipe: e2.id_equipe,
      },
      transaction,
    });

    const equipeAtualizada = await Equipe.findByPk(e1.id_equipe, {
      include: [
        {
          model: Usuario,
          as: "membros",
          attributes: ["id_usuario"],
          through: { attributes: [] },
        },
      ],
      transaction,
    });

    result.push(equipeAtualizada);
  }

  return {
    equipes: result,
    soloRestante: solos[0] ?? null,
  };
};
