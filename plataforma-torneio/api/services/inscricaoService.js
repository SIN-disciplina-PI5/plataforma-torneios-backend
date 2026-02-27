import models from "../models/index.js";
const { Inscricao, Equipe, Torneio } = models;

export const createInscricaoService = async (data) => {
  const { id_equipe, id_torneio } = data;
  if (!id_equipe) throw new Error("ID da equipe é obrigatório");
  if (!id_torneio) throw new Error("ID do torneio é obrigatório");

  const equipe = await Equipe.findByPk(id_equipe);
  if (!equipe) throw new Error("Equipe não encontrada");

  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");

  const inscricaoExistente = await Inscricao.findOne({
    where: { id_equipe, id_torneio }
  });
  if (inscricaoExistente) throw new Error("Essa equipe já está inscrita neste torneio");

  const inscricao = await Inscricao.create({
    id_equipe,
    id_torneio,
    status: "AGUARDANDO"
  });

  return {
    id_inscricao: inscricao.id_inscricao,
    id_equipe: inscricao.id_equipe,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status,
    data_inscricao: inscricao.data_inscricao,
  };
};

export const getAllInscricoesService = async () => {
  const inscricoes = await Inscricao.findAll({
    include: [
      { model: Equipe, as: "equipe", attributes: ["nome"] },
      { model: Torneio, attributes: ["nome", "categoria"] }
    ],
    order: [["data_inscricao", "DESC"]]
  });

  return inscricoes.map(i => ({
    id_inscricao: i.id_inscricao,
    status: i.status,
    equipe: i.equipe ? { id: i.id_equipe, nome: i.equipe.nome } : { id: i.id_equipe },
    torneio: i.Torneio ? { id: i.id_torneio, nome: i.Torneio.nome } : { id: i.id_torneio },
    data_inscricao: i.data_inscricao,
  }));
};

export const getInscricaoByIdService = async (id) => {
  const inscricao = await Inscricao.findByPk(id, {
    include: [
      { model: Equipe, as: "equipe", attributes: ["nome"] },
      { model: Torneio, attributes: ["nome", "categoria", "vagas"] }
    ]
  });
  if (!inscricao) throw new Error("Inscrição não encontrada");

  return {
    id_inscricao: inscricao.id_inscricao,
    status: inscricao.status,
    equipe: inscricao.equipe || { id: inscricao.id_equipe },
    torneio: inscricao.Torneio || { id: inscricao.id_torneio },
    data_inscricao: inscricao.data_inscricao,
  };
};

export const updateInscricaoService = async (id, data) => {
  const { status } = data;
  if (!status) throw new Error("Status é obrigatório");

  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");

  await inscricao.update({ status });
  return {
    id_inscricao: inscricao.id_inscricao,
    id_equipe: inscricao.id_equipe,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status,
  };
};

export const deleteInscricaoService = async (id) => {
  const inscricao = await Inscricao.findByPk(id);
  if (!inscricao) throw new Error("Inscrição não encontrada");
  await inscricao.destroy();
  return { message: "Inscrição cancelada com sucesso" };
};