import models from "../models/index.js";
const { Inscricao, Equipe, Torneio, Usuario } = models;

export const createInscricaoService = async (data) => {
  const { id_usuario, id_torneio } = data;

  if (!id_usuario) throw new Error("ID do usuário é obrigatório");
  if (!id_torneio) throw new Error("ID do torneio é obrigatório");

  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) throw new Error("Usuário não encontrado");

  const torneio = await Torneio.findByPk(id_torneio);
  if (!torneio) throw new Error("Torneio não encontrado");

  const inscricaoExistente = await Inscricao.findOne({
    where: { id_usuario, id_torneio }
  });

  if (inscricaoExistente) {
    throw new Error("Usuário já está inscrito neste torneio");
  }

  const totalAprovadas = await Inscricao.count({
    where: { id_torneio, status: "APROVADA" }
  });

  if (totalAprovadas >= torneio.vagas) {
    throw new Error("Torneio está com todas as vagas preenchidas");
  }

  const inscricao = await Inscricao.create({
    id_usuario,
    id_torneio,
    status: "AGUARDANDO"
  });

  return {
    id_inscricao: inscricao.id_inscricao,
    id_usuario: inscricao.id_usuario,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status,
    data_inscricao: inscricao.data_inscricao,
  };
};

export const getAllInscricoesService = async () => {
  const inscricoes = await Inscricao.findAll({
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email"]
      },
      {
        model: Torneio,
        as: "torneio",
        attributes: ["id_torneio", "nome", "categoria"]
      },
      {
        model: Equipe,
        as: "equipe_dupla",
        attributes: ["id_equipe", "nome"]
      }
    ],
    order: [["data_inscricao", "DESC"]]
  });

  return inscricoes.map(i => ({
    id_inscricao: i.id_inscricao,
    status: i.status,
    usuario: i.usuario
      ? { id: i.id_usuario, nome: i.usuario.nome, email: i.usuario.email }
      : { id: i.id_usuario },
    torneio: i.torneio
      ? { id: i.id_torneio, nome: i.torneio.nome, categoria: i.torneio.categoria }
      : { id: i.id_torneio },
    dupla: i.equipe_dupla || null,
    data_inscricao: i.data_inscricao,
  }));
};

export const getInscricaoByIdService = async (id) => {
  const inscricao = await Inscricao.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email"]
      },
      {
        model: Torneio,
        as: "torneio",
        attributes: ["id_torneio", "nome", "categoria", "vagas"]
      },
      {
        model: Equipe,
        as: "equipe_dupla",
        attributes: ["id_equipe", "nome"],
        include: [
          {
            model: Usuario,
            as: "membros",
            attributes: ["id_usuario", "nome"]
          }
        ]
      }
    ]
  });

  if (!inscricao) throw new Error("Inscrição não encontrada");

  return {
    id_inscricao: inscricao.id_inscricao,
    status: inscricao.status,
    usuario: inscricao.usuario || { id: inscricao.id_usuario },
    torneio: inscricao.torneio || { id: inscricao.id_torneio },
    dupla: inscricao.equipe_dupla || null,
    data_inscricao: inscricao.data_inscricao,
  };
};

export const updateInscricaoService = async (id, data) => {
  const transaction = await sequelize.transaction();
  const inscricao = await Inscricao.findByPk(id,{
    transaction
  });

  if (!inscricao){
    await transaction.rollback();
    throw new Error("Inscrição não encontrada");
  }

  if (data.status === "APROVADA") {
    const torneio = await Torneio.findByPk(
      inscricao.id_torneio,
      { transaction }
    );

    const totalAprovadas = await Inscricao.count({
      where:{
        id_torneio: inscricao.id_torneio,
        status: "APROVADA"
      },
      transaction
    });

    if (totalAprovadas >= torneio.vagas){
      await transaction.rollback();
      throw new Error("Torneio lotado");
    }
  }

  await inscricao.update(
    { status: data.status },
    { transaction }
  );
  await transaction.commit();
  return {
    id_inscricao: inscricao.id_inscricao,
    id_usuario: inscricao.id_usuario,
    id_torneio: inscricao.id_torneio,
    status: inscricao.status
  };
};

export const deleteInscricaoService = async (id) => {
  const inscricao = await Inscricao.findByPk(id);

  if (!inscricao) throw new Error("Inscrição não encontrada");

  await inscricao.destroy();

  return { message: "Inscrição cancelada com sucesso" };
};

export const getInscricoesByTorneioService = async (id_torneio) => {
  const inscricoes = await Inscricao.findAll({
    where: { id_torneio },
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id_usuario", "nome", "email", "patente"]
      },
      {
        model: Equipe,
        as: "equipe_dupla",
        attributes: ["id_equipe", "nome"],
        include: [
          {
            model: Usuario,
            as: "membros",
            attributes: ["id_usuario", "nome"]
          }
        ]
      }
    ],
    order: [["data_inscricao", "ASC"]]
  });

  return inscricoes;
};