import models from "../models/index.js";
const { Inscricao, Torneio } = models;

// Criar nova inscrição
export const createInscricaoService = async ({ id_equipe, id_torneio }) => {
  if (!id_equipe || !id_torneio) {
    throw new Error("Dados faltando para realizar a inscrição");
  }

  //const equipe = await Equipe.findByPk(id_equipe);
  const torneio = await Torneio.findByPk(id_torneio);

  /*if (!equipe || !torneio) {
        throw new Error("Equipe ou Torneio não encontrados");
    }*/

  const inscricaoExistente = await Inscricao.findOne({
    where: { id_equipe, id_torneio },
  });

  if (inscricaoExistente) {
    throw new Error("Essa equipe já está inscrita neste torneio");
  }

  return await Inscricao.create({ id_equipe, id_torneio });
};

// Buscar todas as inscrições
export const getAllInscricoesService = async () => {
  return await Inscricao.findAll();
};

// Buscar inscrição por ID
export const getInscricaoByIdService = async (id) => {
  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");
  return inscricao;
};

// Atualizar inscrição
export const updateInscricaoService = async (id, { status }) => {
  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");

  await inscricao.update({ status });
  return inscricao;
};

// Deletar inscrição
export const deleteInscricaoService = async (id) => {
  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");

  await inscricao.destroy();
  return true;
};
