import models from "../models/index.js";

const { Usuario } = models;

export const createAdminService = async (dados) => {
  const { nome, email, senha } = dados;

  const usuarioExistente = await Usuario.findOnde({ where: { email } });
  if (usuarioExistente) {
    throw new Error("E-mail já cadastrado.");
  }

  const novoAdmin = await Usuario.create({
    nome,
    email,
    senha,
    role: "ADMIN",
    patente: "Administrador",
  });

  return {
    id: novoAdmin.id_usuario,
    nome: novoAdmin.nome,
    email: novoAdmin.email,
    role: novoAdmin.role,
  };
};
