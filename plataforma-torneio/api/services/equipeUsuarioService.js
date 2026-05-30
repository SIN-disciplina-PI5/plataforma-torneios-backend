import models from "../models/index.js";

const { EquipeUsuario, Equipe, Usuario, Inscricao } = models;

export const createEquipeUsuarioService = async (data) => {
  const { id_equipe, id_usuario } = data;
  if (!id_equipe) throw new Error("ID da equipe é obrigatório");
  if (!id_usuario) throw new Error("ID do usuário é obrigatório");

  const equipe = await Equipe.findByPk(id_equipe, {
    include: [{ model: Usuario, as: "membros", attributes: ["id_usuario"] }],
  });
  if (!equipe) throw new Error("Equipe não encontrada");
  if (equipe.membros.length >= 2) throw new Error("Equipe já está cheia");

  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) throw new Error("Usuário não encontrado");

  const inscricao = await Inscricao.findOne({
    where: { id_usuario, id_torneio: equipe.id_torneio, status: true },
  });
  if (!inscricao) throw new Error("Usuário não está inscrito no torneio da equipe");

  const equipeNoTorneio = await Equipe.findOne({
    where: { id_torneio: equipe.id_torneio },
    include: [
      {
        model: Usuario,
        as: "membros",
        where: { id_usuario },
        through: { attributes: [] },
      },
    ],
  });
  if (equipeNoTorneio) throw new Error("Usuário já possui equipe neste torneio");

  const vinculoExistente = await EquipeUsuario.findOne({
    where: { id_equipe, id_usuario },
  });
  if (vinculoExistente) throw new Error("Usuário já está nesta equipe");

  const vinculo = await EquipeUsuario.create({ id_equipe, id_usuario });
  return {
    id_equipe_usuario: vinculo.id_equipe_usuario,
    id_equipe: vinculo.id_equipe,
    id_usuario: vinculo.id_usuario,
  };
};

export const getAllEquipeUsuarioService = async () => {
  const vinculos = await EquipeUsuario.findAll();
  return vinculos.map((v) => ({
    id_equipe_usuario: v.id_equipe_usuario,
    id_equipe: v.id_equipe,
    id_usuario: v.id_usuario,
  }));
};

export const getEquipeUsuarioByIdService = async (id) => {
  const vinculo = await EquipeUsuario.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  return {
    id_equipe_usuario: vinculo.id_equipe_usuario,
    id_equipe: vinculo.id_equipe,
    id_usuario: vinculo.id_usuario,
  };
};

export const deleteEquipeUsuarioService = async (id) => {
  const vinculo = await EquipeUsuario.findByPk(id);
  if (!vinculo) throw new Error("Vínculo não encontrado");
  await vinculo.destroy();
  return { message: "Vínculo removido com sucesso" };
};
