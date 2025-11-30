import { 
  buscarRankingGeralService,
  buscarRankingUsuarioService, 
  buscarPorPosicaoService,
  atualizarPontuacaoService,
  recalcularPosicoesService,
  resetarRankingUsuarioService
} from "../services/rankingService.js";

export const buscarRankingGeral = async (req, res) => {
  try {
    const { limite = 100 } = req.query;
    const ranking = await buscarRankingGeralService(parseInt(limite));
    
    res.json({
      success: true,
      data: ranking,
      message: "Ranking geral recuperado com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar ranking geral",
      error: error.message
    });
  }
};

export const buscarRankingUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const ranking = await buscarRankingUsuarioService(id_usuario);
    
    if (!ranking) {
      return res.status(404).json({
        success: false,
        message: "Ranking do usuário não encontrado"
      });
    }

    res.json({
      success: true,
      data: ranking,
      message: "Ranking do usuário recuperado com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar ranking do usuário",
      error: error.message
    });
  }
};

export const buscarPorPosicao = async (req, res) => {
  try {
    const { posicao } = req.params;
    const ranking = await buscarPorPosicaoService(parseInt(posicao));
    
    if (!ranking) {
      return res.status(404).json({
        success: false,
        message: "Nenhum usuário encontrado nesta posição"
      });
    }

    res.json({
      success: true,
      data: ranking,
      message: "Ranking por posição recuperado com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar ranking por posição",
      error: error.message
    });
  }
};

export const atualizarPontuacao = async (req, res) => {
  try {
    const { id_usuario, tipo_evento, medalha } = req.body;
    
    if (!id_usuario || !tipo_evento) {
      return res.status(400).json({
        success: false,
        message: "id_usuario e tipo_evento são obrigatórios"
      });
    }

    const ranking = await atualizarPontuacaoService(id_usuario, tipo_evento, medalha);

    res.json({
      success: true,
      data: ranking,
      message: "Pontuação atualizada com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar pontuação",
      error: error.message
    });
  }
};

export const recalcularRanking = async (req, res) => {
  try {
    const rankings = await recalcularPosicoesService();
    
    res.json({
      success: true,
      data: rankings,
      message: "Ranking recalculado com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao recalcular ranking",
      error: error.message
    });
  }
};

//  DELETE: Resetar ranking de um usuário
export const resetarRankingUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const ranking = await resetarRankingUsuarioService(id_usuario);

    res.json({
      success: true,
      data: ranking,
      message: "Ranking do usuário resetado com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao resetar ranking do usuário",
      error: error.message
    });
  }
};