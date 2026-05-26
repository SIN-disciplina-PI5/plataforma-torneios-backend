import models from "../models/index.js";
import { Op } from "sequelize";
import { normalizarTextoObrigatorio, normalizarTextoOpcional } from "../utils/validation.js";
const { Torneio, Inscricao, Partida, PartidaUsuario, Equipe, Usuario } = models;

export const createTorneioService = async (dados) => {
  const nome = normalizarTextoObrigatorio(dados.nome, "Nome do torneio");
  const categoria = normalizarTextoObrigatorio(dados.categoria, "Categoria");
  const { vagas, data_inicio, data_fim } = dados;
  if (!vagas) throw new Error("Número de vagas é obrigatório");
  if (!data_inicio) throw new Error("Data de início é obrigatória");
  if (!data_fim) throw new Error("Data de fim é obrigatória");

  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);
  if (isNaN(inicio) || isNaN(fim)) throw new Error("Datas inválidas");
  if (fim <= inicio) throw new Error("Data de fim deve ser posterior à data de início");

  const vagasValidas = [4, 8, 16, 32];
  if (!vagasValidas.includes(Number(vagas))) throw new Error("As vagas devem ser 4, 8, 16 ou 32");

  const torneioExistente = await Torneio.findOne({ where: { nome } });
  if (torneioExistente) throw new Error("Já existe um torneio com este nome");

  const novoTorneio = await Torneio.create({
    nome,
    categoria,
    vagas,
    status: true,
    data_inicio: inicio,
    data_fim: fim,
  });

  return {
    id_torneio: novoTorneio.id_torneio,
    nome: novoTorneio.nome,
    categoria: novoTorneio.categoria,
    vagas: novoTorneio.vagas,
    status: novoTorneio.status,
    data_inicio: novoTorneio.data_inicio,
    data_fim: novoTorneio.data_fim,
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
    data_inicio: t.data_inicio,
    data_fim: t.data_fim,
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
  if (dados.data_inicio || dados.data_fim) {
    const inicio = dados.data_inicio ? new Date(dados.data_inicio) : torneio.data_inicio;
    const fim = dados.data_fim ? new Date(dados.data_fim) : torneio.data_fim;
    if (isNaN(inicio) || isNaN(fim)) throw new Error("Datas inválidas");
    if (fim <= inicio) throw new Error("Data de fim deve ser posterior à data de início");
    dados.data_inicio = inicio;
    dados.data_fim = fim;
  }

  if (dados.nome && dados.nome !== torneio.nome) {
    const torneioExistente = await Torneio.findOne({ where: { nome: dados.nome } });
    if (torneioExistente) throw new Error("Já existe um torneio com este nome");
  }

  if (dados.vagas !== undefined) {
    const vagasValidas = [4, 8, 16, 32];
    if (!vagasValidas.includes(Number(dados.vagas))) {
      throw new Error("As vagas devem ser 4, 8, 16 ou 32");
    }
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
  };
};

export const deleteTorneioService = async (id) => {
  const torneio = await Torneio.findByPk(id);
  if (!torneio) throw new Error("Torneio não encontrado");
  await torneio.destroy();
  return { message: "Torneio deletado com sucesso" };
};

export const gerarChaveService = async (id_torneio) => {
  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");
  if (new Date() > torneio.data_inicio) throw new Error("Não é possível gerar a chave após o início do torneio");

  const partidasExistentes = await Partida.findOne({
    where: { id_torneio }
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
              status: true
            },
            required: true
          }
        ]
      }
    ]
  });

  if (equipesBrutas.length < 2) throw new Error("Não há equipes suficientes para gerar chave");
  let equipes = resolverEquipesSoltas(equipesBrutas);
  const tamanhosValidos = [4, 8, 16, 32];

  if (!tamanhosValidos.includes(equipes.length)) throw new Error("Número inválido de equipes após resolução de solos");
  const embaralhadas = equipes.sort(() => Math.random() - 0.5);
  const partidasCriadas = [];
  const DURACAO_PARTIDA_MINUTOS = 30;
  let horarioAtual = new Date(torneio.data_inicio);
  const totalPartidas = embaralhadas.length / 2;

  const ultimoHorario = new Date(
    horarioAtual.getTime() +
    (totalPartidas - 1) * DURACAO_PARTIDA_MINUTOS * 60000
  );

  if (ultimoHorario > torneio.data_fim) throw new Error("O intervalo do torneio é insuficiente para agendar as partidas");

  let faseInicial = "OITAVAS_DE_FINAL";

  if (equipes.length === 4)
    faseInicial = "SEMI_FINAL";

  if (equipes.length === 8)
    faseInicial = "QUARTAS_DE_FINAL";

  for (let i = 0; i < embaralhadas.length; i += 2) {
    const partida = await Partida.create({
      id_torneio,
      fase: faseInicial,
      status: "PENDENTE",
      horario: new Date(horarioAtual)
    });

    await PartidaUsuario.bulkCreate([
      {
        id_partida: partida.id_partida,
        id_equipe: embaralhadas[i].id_equipe
      },
      {
        id_partida: partida.id_partida,
        id_equipe: embaralhadas[i + 1].id_equipe
      }
    ]);

    partidasCriadas.push({
      id_partida: partida.id_partida,
      fase: partida.fase,
      status: partida.status,
      horario: partida.horario
    });

    horarioAtual = new Date(
      horarioAtual.getTime() +
      DURACAO_PARTIDA_MINUTOS * 60000
    );
  }

  return partidasCriadas;
};

export const avancarFaseService = async (
  id_torneio,
  faseAtual
) => {
  const partidasPendentes = await Partida.count({
    where: {
      id_torneio,
      fase: faseAtual,
      status: {
        [Op.ne]: "FINALIZADA"
      }
    }
  });

  if (partidasPendentes > 0) throw new Error("Ainda existem partidas não finalizadas nessa fase");

  const partidas = await Partida.findAll({
    where: {
      id_torneio,
      fase: faseAtual,
      status: "FINALIZADA"
    },
    order: [["horario", "ASC"]]
  });

  const vencedores = partidas.map( p => p.vencedor_id );

  if (vencedores.length % 2 !== 0) throw new Error("Número inválido de vencedores");

  const mapaFases = {
    OITAVAS_DE_FINAL: "QUARTAS_DE_FINAL",
    QUARTAS_DE_FINAL: "SEMI_FINAL",
    SEMI_FINAL: "FINAL"
  };

  const proximaFase = mapaFases[faseAtual];

  if (!proximaFase) throw new Error("Fase final já concluída");

  const torneio = await Torneio.findByPk(
    id_torneio
  );

  if (!torneio) throw new Error("Torneio não encontrado");

  const ultimaPartida = await Partida.findOne({
    where: { id_torneio },
    order: [["horario", "DESC"]]
  });

  const DURACAO_PARTIDA_MINUTOS = 30;

  let horarioAtual = ultimaPartida?.horario
    ? new Date(
        new Date(ultimaPartida.horario).getTime() +
        DURACAO_PARTIDA_MINUTOS * 60000
      )
    : new Date(torneio.data_inicio);

  const totalNovasPartidas =
    vencedores.length / 2;

  const ultimoHorario = new Date(
    horarioAtual.getTime() +
    (totalNovasPartidas - 1) *
      DURACAO_PARTIDA_MINUTOS *
      60000
  );

  if (ultimoHorario > torneio.data_fim) {
    throw new Error(
      "O intervalo do torneio é insuficiente para avançar a fase"
    );
  }

  const novasPartidas = [];

  for (let i = 0; i < vencedores.length; i += 2) {
    const partida = await Partida.create({
      id_torneio,
      fase: proximaFase,
      status: "PENDENTE",
      horario: new Date(horarioAtual)
    });

    await PartidaUsuario.bulkCreate([
      {
        id_partida: partida.id_partida,
        id_equipe: vencedores[i]
      },
      {
        id_partida: partida.id_partida,
        id_equipe: vencedores[i + 1]
      }
    ]);

    novasPartidas.push({
      id_partida: partida.id_partida,
      fase: partida.fase,
      status: partida.status,
      horario: partida.horario
    });

    horarioAtual = new Date(
      horarioAtual.getTime() +
      DURACAO_PARTIDA_MINUTOS * 60000
    );
  }

  return novasPartidas;
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
  };
};

//função auxiliar
const resolverEquipesSoltas = (equipes) => {
  const full = equipes.filter(e => e.membros.length >= 2);
  let solos = equipes.filter(e => e.membros.length === 1);

  const result = [...full];

  while (solos.length > 1) {
    const e1 = solos.pop();
    const e2 = solos.pop();

    result.push({
      id_equipe: e1.id_equipe,
      membros: [...e1.membros, ...e2.membros],
      nome: `${e1.nome} + ${e2.nome}`,
    });
  }

  if (solos.length === 1) {
    const lastSolo = solos[0];
    const randomIndex = Math.floor(Math.random() * result.length);
    const target = result[randomIndex];

    target.membros.push(...lastSolo.membros);
  }

  return result.filter(e => e.membros.length >= 2);
};
