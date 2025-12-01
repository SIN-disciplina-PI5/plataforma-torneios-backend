import models from "../models/index.js";
const {  Usuario, Ranking, EquipeUsuario, PartidaUsuario, Partida } = models;
import jwt from "jsonwebtoken";

export const criarUsuarioService = async (dados) => {
  const { nome, email, senha } = dados;
  if (!nome || !email || !senha) throw new Error("Dados faltando");

  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) throw new Error("Email já cadastrado");

  const novoUsuario = await Usuario.create({
    nome,
    email,
    senha: senha,
    patente: null,
    role: "USER" 
  });

  const token = jwt.sign(
    { id: novoUsuario.id_usuario, email: novoUsuario.email, role: novoUsuario.role },
    process.env.MY_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) }
  );

  const { senha: _, ...usuarioSeguro } = novoUsuario.toJSON();
  return { novoUsuario: usuarioSeguro, token };
};

export const editarUsuarioService = async (id, dados) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuário não encontrado");
  
  await usuario.update(dados);
  const { senha, ...usuarioSeguro } = usuario.toJSON();
  return usuarioSeguro;
};

export const deletarUsuarioService = async (id) => {
  const deletado = await Usuario.destroy({ where: { id_usuario: id } });
  if (!deletado) throw new Error("Usuário não encontrado");
};

export const visualizarHistoricoService = async (userId) => {
  const equipes = await EquipeUsuario.findAll({
    where: { id_usuario: userId },
    attributes: ["id_equipe"],
  });
  if (!equipes || equipes.length === 0)
    throw new Error("Usuário não está vinculado a nenhuma equipe.");

  let equipeIds = [];
  for (const e of equipes) {
    equipeIds.push(e.id_equipe);
  }

  const partidasEquipes = await PartidaUsuario.findAll({
    where: { id_equipe: equipeIds },
    attributes: ["id_partida"],
  });

  let partidaIds = [];
  for (const pe of partidasEquipes) {
    if (!partidaIds.includes(pe.id_partida)) {
      partidaIds.push(pe.id_partida);
    }
  }

  if (partidaIds.length === 0) return { historico: [] };

  const historico = await Partida.findAll({
    where: { id_partida: partidaIds },
    order: [["horario", "ASC"]],
  });

  return { historico };
};

export const visualizarRankingService = async () => {
  const ranking = await Ranking.findAll({
    order: [["pontos_acumulados", "DESC"]],
  });
  return { ranking };
};
