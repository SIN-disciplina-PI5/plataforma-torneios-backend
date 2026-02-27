import models from "../models/index.js";
import bcrypt from "bcrypt";
const { Usuario } = models;

export const createAdminService = async (dados) => {
  const { nome, email, senha, secretKey } = dados;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error("Chave de segurança inválida. Você não tem permissão para criar um Admin.");
  }

  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) throw new Error("E-mail já cadastrado.");

  const novoAdmin = await Usuario.create({
    nome, email, senha,
    role: "ADMIN",
    patente: "Administrador",
  });

  return {
    id_usuario: novoAdmin.id_usuario,
    nome: novoAdmin.nome,
    email: novoAdmin.email,
    role: novoAdmin.role,
  };
};

export const updateAdminService = async (id, dados) => {
  const admin = await Usuario.findByPk(id);
  if (!admin) throw new Error("Administrador não encontrado.");

  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, 12);
  }

  await admin.update(dados);
  return {
    id_usuario: admin.id_usuario,
    nome: admin.nome,
    email: admin.email,
    role: admin.role,
  };
};

export const deleteAdminService = async (id) => {
  const admin = await Usuario.findByPk(id);
  if (!admin) throw new Error("Administrador não encontrado.");
  await admin.destroy();
  return { message: "Administrador deletado com sucesso." };
};

export const getAdminByIdService = async (id_usuario) => {
  const admin = await Usuario.findByPk(id_usuario);
  if (!admin) throw new Error("Administrador não encontrado.");
  return {
    id_usuario: admin.id_usuario,
    nome: admin.nome,
    email: admin.email,
    role: admin.role,
    patente: admin.patente,
  };
};