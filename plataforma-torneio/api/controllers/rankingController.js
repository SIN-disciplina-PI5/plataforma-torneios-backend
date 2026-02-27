import {
  getRankingGeralService,
  getRankingUsuarioService,
  getRankingByPosicaoService,
  atualizarPontuacaoService,
  recalcularRankingCompletoService,
  resetarRankingUsuarioService,
} from "../services/rankingService.js";

export const getRankingGeral = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 100;
    const ranking = await getRankingGeralService(limite);
    return res.status(200).json({
      results: ranking.length,
      data: ranking,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRankingUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const ranking = await getRankingUsuarioService(id_usuario);
    if (!ranking) {
      return res.status(404).json({ error: "Ranking do usuário não encontrado" });
    }
    return res.status(200).json({ data: ranking });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRankingByPosicao = async (req, res) => {
  try {
    const posicao = parseInt(req.params.posicao);
    const ranking = await getRankingByPosicaoService(posicao);
    return res.status(200).json({ data: ranking });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

export const atualizarPontuacao = async (req, res) => {
  try {
    const { id_usuario, tipo_evento } = req.body;
    if (!id_usuario || !tipo_evento) {
      return res.status(400).json({ error: "id_usuario e tipo_evento são obrigatórios" });
    }
    const ranking = await atualizarPontuacaoService(id_usuario, tipo_evento);
    return res.status(200).json({
      message: "Pontuação atualizada com sucesso",
      data: ranking,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const recalcularRanking = async (req, res) => {
  try {
    const result = await recalcularRankingCompletoService();
    return res.status(200).json({
      message: result.message,
      data: { total: result.total },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const resetarRankingUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const ranking = await resetarRankingUsuarioService(id_usuario);
    return res.status(200).json({
      message: "Ranking do usuário resetado com sucesso",
      data: ranking,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};