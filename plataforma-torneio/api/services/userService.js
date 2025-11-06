import models from "../models/index.js";
const { Usuario } = models;
import jwt from "jsonwebtoken";

export const criarUsuarioService = async (dados) => {
  const { nome, email, senha } = dados;
  if (!nome || !email || !senha) throw new Error("Dados faltando");

  const novoUsuario = await Usuario.create({
    nome,
    email,
    senha,
    patente: null,
    role: "USER",
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