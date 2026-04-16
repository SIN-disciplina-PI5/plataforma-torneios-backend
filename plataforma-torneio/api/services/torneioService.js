import models from "../models/index.js";
import { Op } from "sequelize";
const { Torneio, Inscricao, Partida, PartidaUsuario } = models;

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

export const gerarChaveService = async (id_torneio) => {
  const partidasExistentes = await Partida.findOne({
    where: { id_torneio }
  });
  if (partidasExistentes)
    throw new Error("A chave do torneio já foi gerada");

  const inscricoes = await Inscricao.findAll({
    where: {
      id_torneio,
      status: "APROVADA"
    }
  });

  const equipes = inscricoes.map(i => i.id_equipe);
  if (equipes.length < 2)
    throw new Error("Não há equipes suficientes para gerar chave");

  const tamanhosValidos = [4, 8, 16, 32, 64];

  if (!tamanhosValidos.includes(equipes.length))
    throw new Error("Número de equipes inválido para torneio eliminatório");

  const embaralhadas = equipes.sort(() => Math.random() - 0.5);

  const partidasCriadas = [];

  for (let i = 0; i < embaralhadas.length; i += 2) {
    const partida = await Partida.create({
      id_torneio,
      fase: "OITAVAS_DE_FINAL",
      status: "PENDENTE"
    });

    await PartidaUsuario.bulkCreate([
      {
        id_partida: partida.id_partida,
        id_equipe: embaralhadas[i]
      },
      {
        id_partida: partida.id_partida,
        id_equipe: embaralhadas[i + 1]
      }
    ]);

    partidasCriadas.push({
      id_partida: partida.id_partida,
      fase: partida.fase,
      status: partida.status
    });
  }
  return partidasCriadas;
};

export const avancarFaseService = async (id_torneio, faseAtual) => {
  const partidasPendentes = await Partida.count({
    where: {
      id_torneio,
      fase: faseAtual,
      status: {
        [Op.ne]: "FINALIZADA"
      }
    }
  });

  if (partidasPendentes > 0)
    throw new Error("Ainda existem partidas não finalizadas nessa fase");

  const partidas = await Partida.findAll({
    where: {
      id_torneio,
      fase: faseAtual,
      status: "FINALIZADA"
    }
  });

  const vencedores = partidas.map(p => p.vencedor_id);
  if (vencedores.length % 2 !== 0)
    throw new Error("Número inválido de vencedores");

  const mapaFases = {
    "OITAVAS_DE_FINAL": "QUARTAS_DE_FINAL",
    "QUARTAS_DE_FINAL": "SEMI_FINAL",
    "SEMI_FINAL": "FINAL"
  };

  const proximaFase = mapaFases[faseAtual];

  if (!proximaFase)
    throw new Error("Fase final já concluída");

  const novasPartidas = [];

  for (let i = 0; i < vencedores.length; i += 2) {
    const partida = await Partida.create({
      id_torneio,
      fase: proximaFase,
      status: "PENDENTE"
    });

    await PartidaUsuario.bulkCreate([
      { id_partida: partida.id_partida, id_equipe: vencedores[i] },
      { id_partida: partida.id_partida, id_equipe: vencedores[i + 1] }
    ]);

    novasPartidas.push({
      id_partida: partida.id_partida,
      fase: partida.fase,
      status: partida.status
    });
  }
  return novasPartidas;
};

export const atualizarStatusService = async (id_torneio, status) => {
  const torneio = await Torneio.findByPk(id_torneio);

  if (!torneio)
    throw new Error("Torneio não encontrado");

  await torneio.update({ status });
  return {
    id_torneio: torneio.id_torneio,
    nome: torneio.nome,
    categoria: torneio.categoria,
    vagas: torneio.vagas,
    status: torneio.status
  };
};