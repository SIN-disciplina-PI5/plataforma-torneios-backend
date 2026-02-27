import models from "../models/index.js";
const { Ranking, Usuario } = models;

const PATENTES = {
  0: "Iniciante",
  50: "Amador",
  150: "Semi-Pro",
  300: "Profissional",
  500: "Lenda da Arena"
};

const REGRA_PONTOS = {
  VITORIA_FASE_GRUPOS: 5,
  AVANCO_FASE: 10,
  FINALISTA: 20,
  CAMPEAO: 50
};

const buscarOuCriarRanking = async (id_usuario) => {
  let ranking = await Ranking.findOne({ where: { id_usuario } });
  if (!ranking) {
    ranking = await Ranking.create({
      id_usuario,
      pontos_acumulados: 0,
      posicao_atual: null
    });
  }
  return ranking;
};

const definirPatente = (pontos) => {
  const limites = Object.keys(PATENTES).map(Number).sort((a, b) => b - a);
  for (const limite of limites) {
    if (pontos >= limite) return PATENTES[limite];
  }
  return "Iniciante";
};

const atualizarPatenteUsuario = async (id_usuario, pontos) => {
  const patente = definirPatente(pontos);
  await Usuario.update({ patente }, { where: { id_usuario } });
  return patente;
};

const recalcularPosicoes = async () => {
  const rankings = await Ranking.findAll({ order: [["pontos_acumulados", "DESC"]] });
  for (let i = 0; i < rankings.length; i++) {
    await rankings[i].update({ posicao_atual: i + 1 });
  }
  return rankings;
};

export const getRankingGeralService = async (limite = 100) => {
  const rankings = await Ranking.findAll({
    include: [{ model: Usuario, as: "usuario", attributes: ["id_usuario", "nome", "patente"] }],
    order: [["pontos_acumulados", "DESC"]],
    limit: limite
  });

  return rankings.map((r, index) => ({
    posicao: r.posicao_atual || index + 1,
    pontos: r.pontos_acumulados,
    usuario: r.usuario ? {
      id: r.usuario.id_usuario,
      nome: r.usuario.nome,
      patente: r.usuario.patente,
    } : { id: r.id_usuario },
    ultima_atualizacao: r.ultima_atualizacao,
  }));
};

export const getRankingUsuarioService = async (id_usuario) => {
  const ranking = await Ranking.findOne({
    where: { id_usuario },
    include: [{ model: Usuario, as: "usuario", attributes: ["id_usuario", "nome", "patente"] }]
  });

  if (!ranking) return null;

  return {
    posicao: ranking.posicao_atual,
    pontos: ranking.pontos_acumulados,
    usuario: ranking.usuario ? {
      id: ranking.usuario.id_usuario,
      nome: ranking.usuario.nome,
      patente: ranking.usuario.patente,
    } : null,
    ultima_atualizacao: ranking.ultima_atualizacao,
  };
};

export const getRankingByPosicaoService = async (posicao) => {
  const ranking = await Ranking.findOne({
    where: { posicao_atual: posicao },
    include: [{ model: Usuario, as: "usuario", attributes: ["id_usuario", "nome", "patente"] }]
  });

  if (!ranking) throw new Error("Nenhum usuário encontrado nesta posição");

  return {
    posicao: ranking.posicao_atual,
    pontos: ranking.pontos_acumulados,
    usuario: ranking.usuario ? {
      id: ranking.usuario.id_usuario,
      nome: ranking.usuario.nome,
      patente: ranking.usuario.patente,
    } : null,
  };
};

export const atualizarPontuacaoService = async (id_usuario, tipoEvento) => {
  const pontos = REGRA_PONTOS[tipoEvento];
  if (!pontos) throw new Error("Tipo de evento inválido");

  const ranking = await buscarOuCriarRanking(id_usuario);
  ranking.pontos_acumulados += pontos;
  ranking.ultima_atualizacao = new Date();
  await ranking.save();

  await recalcularPosicoes();

  const novaPatente = await atualizarPatenteUsuario(id_usuario, ranking.pontos_acumulados);

  return {
    id_usuario,
    pontos_acumulados: ranking.pontos_acumulados,
    posicao_atual: ranking.posicao_atual,
    patente: novaPatente,
  };
};

export const resetarRankingUsuarioService = async (id_usuario) => {
  const ranking = await Ranking.findOne({ where: { id_usuario } });
  if (!ranking) throw new Error("Ranking do usuário não encontrado");

  await ranking.update({
    pontos_acumulados: 0,
    posicao_atual: null,
    ultima_atualizacao: new Date()
  });

  await recalcularPosicoes();
  await Usuario.update({ patente: "Iniciante" }, { where: { id_usuario } });

  return {
    id_usuario,
    pontos_acumulados: 0,
    patente: "Iniciante",
  };
};

export const recalcularRankingCompletoService = async () => {
  const rankings = await recalcularPosicoes();
  return { message: "Ranking recalculado com sucesso", total: rankings.length };
};