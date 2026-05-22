import models from "../models/index.js";
import { normalizarTextoObrigatorio, normalizarTextoOpcional } from "../utils/validation.js";
const { Usuario, Ranking, EquipeUsuario, PartidaUsuario, Partida, Equipe, Torneio } = models;

const podeAcessarUsuario = (id, usuarioLogado = null) =>
  usuarioLogado?.role === "ADMIN" || usuarioLogado?.id === id;

export const createUsuarioService = async (dados) => {
  const nome = normalizarTextoObrigatorio(dados.nome, "Nome");
  const email = normalizarTextoObrigatorio(dados.email, "Email").toLowerCase();
  const senha = normalizarTextoObrigatorio(dados.senha, "Senha");

  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) throw new Error("Email já cadastrado");

  const novoUsuario = await Usuario.create({
    nome, email, senha,
    role: "USER",
    patente: "Iniciante"
  });

  return {
    id_usuario: novoUsuario.id_usuario,
    nome: novoUsuario.nome,
    email: novoUsuario.email,
    role: novoUsuario.role,
    patente: novoUsuario.patente,
  };
};

export const getAllUsuariosService = async () => {
  const usuarios = await Usuario.findAll({
    attributes: ["id_usuario", "nome", "email", "role", "patente"],
    order: [["nome", "ASC"]]
  });
  return usuarios;
};

export const getUsuarioByIdService = async (id, usuarioLogado = null) => {
  if (!podeAcessarUsuario(id, usuarioLogado)) throw new Error("Acesso negado");

  const usuario = await Usuario.findByPk(id, {
    attributes: ["id_usuario", "nome", "email", "role", "patente"],
    include: [{ model: Ranking, as: "ranking", attributes: ["pontos_acumulados", "posicao_atual"] }]
  });
  if (!usuario) throw new Error("Usuário não encontrado");

  const { ranking, ...dadosUsuario } = usuario.toJSON();
  return {
    ...dadosUsuario,
    ranking: ranking ? {
      pontos: ranking.pontos_acumulados,
      posicao: ranking.posicao_atual,
    } : null,
  };
};

export const updateUsuarioService = async (id, dados = {}, usuarioLogado = null) => {
  if (!podeAcessarUsuario(id, usuarioLogado)) throw new Error("Acesso negado");

  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuário não encontrado");
  const camposPermitidos = ["nome", "email", "senha"];
  if (usuarioLogado && usuarioLogado.role === "ADMIN") {
    camposPermitidos.push(
      "role",
      "patente"
    );
  }
  for (const campo of Object.keys(dados)) {
    if (!camposPermitidos.includes(campo)) {
      throw new Error(`Campo ${campo} não pode ser alterado`);
    }
  }
  const dadosFiltrados = {};
  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      dadosFiltrados[campo] = dados[campo];
    }
  }
  if (dadosFiltrados.nome !== undefined) {
    dadosFiltrados.nome = normalizarTextoOpcional(dadosFiltrados.nome, "Nome");
  }
  if (dadosFiltrados.email !== undefined) {
    dadosFiltrados.email = normalizarTextoOpcional(dadosFiltrados.email, "Email").toLowerCase();
  }
  if (dadosFiltrados.senha !== undefined) {
    dadosFiltrados.senha = normalizarTextoOpcional(dadosFiltrados.senha, "Senha");
  }
  await usuario.update(dadosFiltrados);
  return {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    patente: usuario.patente,
  }
};

export const deleteUsuarioService = async (id, usuarioLogado = null) => {
  if (!podeAcessarUsuario(id, usuarioLogado)) throw new Error("Acesso negado");

  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuário não encontrado");
  await usuario.destroy();
  return { message: "Usuário deletado com sucesso" };
};
