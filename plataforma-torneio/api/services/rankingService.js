import models from "../models/index.js";
const { Ranking, Usuario } = models;

// GET /ranking/geral - Listar ranking

// GET /ranking/usuario/:id - Buscar por usuário

// GET /ranking/posicao/:posicao - Buscar por posição

// POST /ranking/atualizar - Atualizar pontos 

// POST /ranking/recalcular - Recalcular tudo 

// DELETE /ranking/resetar/:id - Resetar usuário 


// Definição das patentes baseadas em pontos
const PATENTES = {
  0: "Iniciante",
  50: "Amador",
  150: "Semi-Pro", 
  300: "Profissional",
  500: "Lenda da Arena"
};

// Regras de pontuação
const REGRA_PONTOS = {
  VITORIA_FASE_GRUPOS: 5,
  AVANCO_FASE: 10,
  FINALISTA: 20,
  CAMPEAO: 50
};

// Buscar ranking e se NÃO existe ele CRIA ranking para usuário
const buscarOuCriarRanking = async (id_usuario) => {
  let ranking = await Ranking.findOne({
    where: { id_usuario }
  });

  if (!ranking) {
    ranking = await Ranking.create({ 
      id_usuario,
      pontos_acumulados: 0,
      posicao_atual: null
    });
  }

  return ranking;
};

// Registrar medalha no usuário
const registrarMedalha = async (id_usuario, tipoMedalha) => {
  console.log(`Medalha ${tipoMedalha} registrada para usuário ${id_usuario}`);
  // Futuro: implementar tabela de Medalhas
};

// Definir patente baseada nos pontos
const definirPatente = (pontos) => {
  const limites = Object.keys(PATENTES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const limite of limites) {
    if (pontos >= limite) {
      return PATENTES[limite];
    }
  }
  return "Iniciante";
};

// Atualizar patente do usuário
const atualizarPatenteUsuario = async (id_usuario, pontos) => {
  const patente = definirPatente(pontos);
  
  await Usuario.update(
    { patente },
    { where: { id_usuario } }
  );
  
  return patente;
};

// Resetar ranking de um usuário (tipo quando tem penalidades)
export const resetarRankingUsuarioService = async (id_usuario) => {
  const ranking = await Ranking.findOne({
    where: { id_usuario }
  });

  if (!ranking) {
    throw new Error("Ranking do usuário não encontrado");
  }

  // Resetar pontos e posição
  await ranking.update({
    pontos_acumulados: 0,
    posicao_atual: null,
    ultima_atualizacao: new Date()
  });

  // Recalcular posições gerais
  await recalcularPosicoesService();

  // Atualizar patente para "Iniciante"
  await atualizarPatenteUsuario(id_usuario, 0);

  return ranking;
};

// Atualizar pontuação do usuário
export const atualizarPontuacaoService = async (id_usuario, tipoEvento, medalha = null) => {
  const ranking = await buscarOuCriarRanking(id_usuario);
  
  let pontos = 0;
  switch(tipoEvento) {
    case 'VITORIA_FASE_GRUPOS':
      pontos = REGRA_PONTOS.VITORIA_FASE_GRUPOS;
      break;
    case 'AVANCO_FASE':
      pontos = REGRA_PONTOS.AVANCO_FASE;
      break;
    case 'FINALISTA':
      pontos = REGRA_PONTOS.FINALISTA;
      break;
    case 'CAMPEAO':
      pontos = REGRA_PONTOS.CAMPEAO;
      if (medalha) {
        await registrarMedalha(id_usuario, medalha);
      }
      break;
    default:
      pontos = 0;
  }

  // Atualizar pontos acumulados
  ranking.pontos_acumulados += pontos;
  ranking.ultima_atualizacao = new Date();
  await ranking.save();

  // Recalcular posição geral
  await recalcularPosicoesService();

  // Atualizar patente do usuário
  await atualizarPatenteUsuario(id_usuario, ranking.pontos_acumulados);

  return ranking;
};

// Recalcular todas as posições no ranking
export const recalcularPosicoesService = async () => {
  const rankings = await Ranking.findAll({
    order: [['pontos_acumulados', 'DESC']]
  });

  for (let i = 0; i < rankings.length; i++) {
    await rankings[i].update({
      posicao_atual: i + 1
    });
  }

  return rankings;
};

// Buscar ranking por posição
export const buscarPorPosicaoService = async (posicao) => {
  return await Ranking.findOne({
    where: { posicao_atual: posicao },
    include: [{ 
      association: 'usuario', 
      attributes: ['id_usuario', 'nome', 'patente', 'email'] 
    }]
  });
};

// Buscar ranking geral ordenado
export const buscarRankingGeralService = async (limite = 100) => {
  return await Ranking.findAll({
    include: [{ 
      association: 'usuario', 
      attributes: ['id_usuario', 'nome', 'patente', 'email'] 
    }],
    order: [['pontos_acumulados', 'DESC']],
    limit: limite
  });
};

// Buscar ranking específico de um usuário
export const buscarRankingUsuarioService = async (id_usuario) => {
  return await Ranking.findOne({
    where: { id_usuario },
    include: [{ 
      association: 'usuario', 
      attributes: ['id_usuario', 'nome', 'patente', 'email'] 
    }]
  });
};