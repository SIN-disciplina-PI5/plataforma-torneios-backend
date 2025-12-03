import models from "../models/index.js";
const { PartidaUsuario, Partida, Equipe } = models; 

export const criarPartidaUsuarioService = async (dados) => {
  const { id_partida, id_equipe } = dados; 
  if (!id_partida || !id_equipe) throw new Error("Dados faltando");

  const partida = await Partida.findByPk(id_partida);
  if (!partida) throw new Error("Partida não encontrada");

  const equipe = await Equipe.findByPk(id_equipe); 
  if (!equipe) throw new Error("Equipe não encontrada");

  const vinculoExistente = await PartidaUsuario.findOne({
    where: { id_partida, id_equipe } 
  });
  if (vinculoExistente) throw new Error("Equipe já vinculada a esta partida");

  const novoVinculo = await PartidaUsuario.create({
    id_partida,
    id_equipe, 
  });

  return novoVinculo;
};

export const buscarPartidaUsuarioService = async (id) => {
  const partidaUsuario = await PartidaUsuario.findByPk(id, {
    include: [
      {
        model: Partida,
        attributes: ['fase', 'status', 'horario']
      },
      {
        model: Equipe, 
        as: 'equipe', 
        attributes: ['nome'] 
      }
    ]
  });
  if (!partidaUsuario) throw new Error("Vínculo não encontrado");
  return partidaUsuario;
};

export const listarPartidasUsuarioService = async (filtros = {}) => {
  return await PartidaUsuario.findAll({
    where: filtros,
    include: [
      {
        model: Partida,
        attributes: ['fase', 'status', 'horario']
      },
      {
        model: Equipe, 
        as: 'equipe',
        attributes: ['nome']
      }
    ]
  });
};

export const editarPartidaUsuarioService = async (id, dados) => {
  const partidaUsuario = await PartidaUsuario.findByPk(id);
  if (!partidaUsuario) throw new Error("Vínculo não encontrado");
  await partidaUsuario.update(dados);
  return partidaUsuario;
};

export const deletarPartidaUsuarioService = async (id) => {
  const deletado = await PartidaUsuario.destroy({ 
    where: { id_partida_usuario: id } 
  });
  if (!deletado) throw new Error("Vínculo não encontrado");
};

export const vincularJogadorService = async (id_partida, id_equipe) => { 
  return await criarPartidaUsuarioService({ 
    id_partida, 
    id_equipe 
  });
};

export const definirResultadoService = async (id_partida_usuario, status) => {
  const partidaUsuario = await PartidaUsuario.findByPk(id_partida_usuario);
  if (!partidaUsuario) throw new Error("Vínculo não encontrado");

  await partidaUsuario.update({
    status_individual: status
  });
  
  return partidaUsuario;
};