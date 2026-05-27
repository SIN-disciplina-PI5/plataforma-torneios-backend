import models from "../models/index.js";
import { notificarMembrosService } from "./notificacaoService.js";
import {
  normalizarTextoObrigatorio,
  normalizarTextoOpcional,
} from "../utils/validation.js";

const { Equipe, EquipeUsuario, Inscricao, Torneio, Usuario } = models;

const buscarEquipeDoUsuarioNoTorneio = async (id_torneio, id_usuario, options = {}) =>
  Equipe.findOne({
    include: [
      {
        model: Usuario,
        as: "membros",
        where: { id_usuario },
        through: { attributes: [] },
      },
    ],
    where: { id_torneio },
    ...options,
  });

export const createEquipeService = async (id_torneio, id_usuario, nome) => {
  nome = normalizarTextoObrigatorio(nome, "Nome da equipe");
  const transaction = await models.sequelize.transaction();

  try {
    const torneio = await Torneio.findByPk(id_torneio, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!torneio) throw new Error("Torneio não encontrado");

    const inscricao = await Inscricao.findOne({
      where: { id_usuario, id_torneio, status: true },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!inscricao) throw new Error("Usuário não está inscrito no torneio");

    const equipeJaExistente = await buscarEquipeDoUsuarioNoTorneio(id_torneio, id_usuario, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (equipeJaExistente) throw new Error("Usuário já possui equipe neste torneio");

    const equipeExistente = await Equipe.findOne({
      where: { nome, id_torneio },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (equipeExistente) throw new Error("Já existe uma equipe com este nome neste torneio");

    const equipe = await Equipe.create({ nome, id_torneio }, { transaction });
    await EquipeUsuario.create({ id_equipe: equipe.id_equipe, id_usuario }, { transaction });

    await transaction.commit();

    await notificarMembrosService(
      [id_usuario],
      "Equipe criada",
      "Sua equipe foi criada com sucesso",
      "EQUIPE",
    );

    return {
      id_equipe: equipe.id_equipe,
      nome: equipe.nome,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const entrarNaEquipeService = async (id_torneio, id_usuario, id_equipe) => {
  const transaction = await models.sequelize.transaction();

  try {
    const torneio = await Torneio.findByPk(id_torneio, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!torneio) throw new Error("Torneio não encontrado");

    const inscricao = await Inscricao.findOne({
      where: { id_usuario, id_torneio, status: true },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!inscricao) throw new Error("Usuário não está inscrito no torneio");

    const equipeJaExistente = await buscarEquipeDoUsuarioNoTorneio(id_torneio, id_usuario, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (equipeJaExistente) throw new Error("Usuário já possui uma equipe neste torneio");

    const equipe = await Equipe.findByPk(id_equipe, {
      include: [{ model: Usuario, as: "membros", attributes: ["id_usuario"] }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!equipe) throw new Error("Equipe não encontrada");
    if (equipe.id_torneio !== id_torneio) throw new Error("Equipe não pertence a este torneio");
    if (equipe.membros.length >= 2) throw new Error("Equipe já está cheia");

    await EquipeUsuario.create({ id_equipe, id_usuario }, { transaction });
    await transaction.commit();

    const membros = equipe.membros.map((m) => m.id_usuario);

    await notificarMembrosService(
      membros,
      "Novo membro",
      "Um novo jogador entrou na sua equipe",
      "EQUIPE",
    );

    await notificarMembrosService(
      [id_usuario],
      "Entrada confirmada",
      "Você entrou em uma equipe",
      "EQUIPE",
    );

    return { message: "Usuário entrou na equipe" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const sairDaEquipeService = async (id_torneio, id_usuario) => {
  const equipes = await Equipe.findAll({
    where: { id_torneio },
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario"],
      },
    ],
  });
  const equipe = equipes.find((e) =>
    e.membros.some((m) => m.id_usuario === id_usuario),
  );

  if (!equipe) {
    throw new Error("Usuário não está em nenhuma equipe neste torneio");
  }

  await EquipeUsuario.destroy({
    where: {
      id_usuario,
      id_equipe: equipe.id_equipe,
    },
  });

  const outrosMembros = equipe.membros
    .map((m) => m.id_usuario)
    .filter((id) => id !== id_usuario);

  await notificarMembrosService(
    outrosMembros,
    "Membro saiu",
    "Um membro saiu da sua equipe",
    "EQUIPE",
  );

  await notificarMembrosService(
    [id_usuario],
    "Saída confirmada",
    "Você saiu da equipe",
    "EQUIPE",
  );

  const equipeAtualizada = await Equipe.findByPk(equipe.id_equipe, {
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario"],
      },
    ],
  });

  if (!equipeAtualizada || equipeAtualizada.membros.length === 0) {
    await Equipe.destroy({
      where: {
        id_equipe: equipe.id_equipe,
      },
    });
  }

  return { message: "Usuário saiu da equipe" };
};

export const getAllEquipesService = async (id_torneio) => {
  const where = id_torneio ? { id_torneio } : {};
  const equipes = await Equipe.findAll({
    where,
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario", "nome", "foto_perfil"],
        through: { attributes: [] },
      },
    ],
  });

  return equipes.map((e) => ({
    id_equipe: e.id_equipe,
    nome: e.nome,
    id_torneio: e.id_torneio,
    membros: e.membros,
    completa: e.membros.length === 2,
  }));
};

export const getEquipeByIdService = async (id) => {
  const equipe = await Equipe.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario", "nome", "foto_perfil"],
        through: { attributes: [] },
      },
    ],
  });
  if (!equipe) throw new Error("Equipe não encontrada");

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
    id_torneio: equipe.id_torneio,
    membros: equipe.membros,
    completa: equipe.membros.length === 2,
  };
};

export const updateEquipeService = async (id, data) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  const dadosPermitidos = {};
  if (data.nome !== undefined) {
    dadosPermitidos.nome = normalizarTextoOpcional(data.nome, "Nome da equipe");
  }

  if (dadosPermitidos.nome && dadosPermitidos.nome !== equipe.nome) {
    const equipeExistente = await Equipe.findOne({
      where: {
        nome: dadosPermitidos.nome,
        id_torneio: equipe.id_torneio,
      },
    });
    if (equipeExistente) throw new Error("Já existe equipe com este nome");
  }

  await equipe.update(dadosPermitidos);

  return {
    id_equipe: equipe.id_equipe,
    nome: equipe.nome,
  };
};

export const deleteEquipeService = async (id) => {
  const equipe = await Equipe.findByPk(id);
  if (!equipe) throw new Error("Equipe não encontrada");
  await equipe.destroy();
  return {
    message: "Equipe deletada com sucesso",
  };
};

export const adminAddMembroService = async (id_equipe, id_usuario) => {
  const transaction = await models.sequelize.transaction();

  try {
    const equipe = await Equipe.findByPk(id_equipe, {
      include: [
        {
          model: Usuario,
          as: "membros",
          attributes: ["id_usuario"],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!equipe) throw new Error("Equipe não encontrada");

    const usuario = await Usuario.findByPk(id_usuario, { transaction });
    if (!usuario) throw new Error("Usuário não encontrado");

    const inscricao = await Inscricao.findOne({
      where: {
        id_usuario,
        id_torneio: equipe.id_torneio,
        status: true,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inscricao) throw new Error("Usuário não está inscrito neste torneio");

    const equipeExistente = await buscarEquipeDoUsuarioNoTorneio(
      equipe.id_torneio,
      id_usuario,
      { transaction, lock: transaction.LOCK.UPDATE },
    );

    if (equipeExistente) throw new Error("Usuário já pertence a uma equipe neste torneio");
    if (equipe.membros.length >= 2) throw new Error("Equipe já está cheia");

    await EquipeUsuario.create(
      {
        id_equipe,
        id_usuario,
      },
      { transaction },
    );

    await transaction.commit();

    const membrosIds = equipe.membros.map((m) => m.id_usuario);

    await notificarMembrosService(
      membrosIds,
      "Novo membro adicionado pelo administrador",
      `O administrador adicionou ${usuario.nome} à equipe`,
      "EQUIPE",
    );

    await notificarMembrosService(
      [id_usuario],
      "Você foi adicionado a uma equipe",
      `O administrador adicionou você à equipe ${equipe.nome}`,
      "EQUIPE",
    );

    return {
      message: "Usuário adicionado à equipe com sucesso",
      id_equipe,
      id_usuario,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const adminRemoveMembroService = async (id_equipe, id_usuario) => {
  const equipe = await Equipe.findByPk(id_equipe, {
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario"],
      },
    ],
  });

  if (!equipe) throw new Error("Equipe não encontrada");

  const isMembro = equipe.membros.some((m) => m.id_usuario === id_usuario);

  if (!isMembro) throw new Error("Usuário não pertence a esta equipe");

  await EquipeUsuario.destroy({
    where: {
      id_equipe,
      id_usuario,
    },
  });

  const outrosMembros = equipe.membros
    .map((m) => m.id_usuario)
    .filter((id) => id !== id_usuario);

  await notificarMembrosService(
    outrosMembros,
    "Membro removido pelo administrador",
    "O administrador removeu um membro da equipe",
    "EQUIPE",
  );

  await notificarMembrosService(
    [id_usuario],
    "Você foi removido de uma equipe",
    `O administrador removeu você da equipe ${equipe.nome}`,
    "EQUIPE",
  );

  const equipeAtualizada = await Equipe.findByPk(id_equipe, {
    include: [
      {
        model: Usuario,
        as: "membros",
        attributes: ["id_usuario"],
      },
    ],
  });

  if (!equipeAtualizada || equipeAtualizada.membros.length === 0) {
    await Equipe.destroy({
      where: {
        id_equipe,
      },
    });

    return {
      message: "Usuário removido e equipe deletada pois ficou vazia",
    };
  }

  return {
    message: "Usuário removido da equipe com sucesso",
    id_equipe,
    id_usuario,
  };
};
