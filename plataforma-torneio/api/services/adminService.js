import models from "../models/index.js";
const { Usuario } = models;

export const createAdminService = async (dados) => {
  // Desestrutura os dados que vieram do req.body
  const { nome, email, senha } = dados;

  // 1. Verifica duplicidade
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    throw new Error("E-mail já cadastrado.");
  }

  // 2. Cria o admin. A senha é criptografada automaticamente pelo model.
  const novoAdmin = await Usuario.create({
    nome,
    email,
    senha,
    role: "ADMIN",
    patente: "Administrador",
  });

  // 3. Retorna os dados limpos
  return {
    id_usuario: novoAdmin.id_usuario,
    nome: novoAdmin.nome,
    email: novoAdmin.email,
    role: novoAdmin.role,
  };
};
