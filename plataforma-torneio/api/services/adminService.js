import models from "../models/index.js";
import bcrypt from "bcrypt";
const { Usuario } = models;

export const createAdminService = async (dados) => {
  // Desestrutura os dados que vieram do req.body
  const { nome, email, senha, secretKey } = dados;

  // 1. VALIDAÇÃO DE SEGURANÇA
  // Se a chave não vier ou estiver errada, bloqueia o cadastro.
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error(
      "Chave de segurança inválida. Você não tem permissão para criar um Admin."
    );
  }

  // 2. Verifica duplicidade
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    throw new Error("E-mail já cadastrado.");
  }

  // 3. Cria o admin. A senha é criptografada automaticamente pelo model.
  const novoAdmin = await Usuario.create({
    nome,
    email,
    senha,
    role: "ADMIN",
    patente: "Administrador",
  });

  // 4. Retorna os dados limpos
  return {
    id_usuario: novoAdmin.id_usuario,
    nome: novoAdmin.nome,
    email: novoAdmin.email,
    role: novoAdmin.role,
  };
};

export const updateAdminService = async (id, dados) => {
  const admin = await Usuario.findByPk(id);
  if (!admin) {
    throw new Error("Administrador não encontrado.");
  }

  // Se o usuário mandou uma nova senha, precisamos criptografar manualmente
  // pois o hook 'beforeCreate' só roda na criação.
  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, 12);
  }

  // Atualiza os dados
  await admin.update(dados);

  // Retorna os dados atualizados (sem a senha)
  return {
    id_usuario: admin.id_usuario,
    nome: admin.nome,
    email: admin.email,
    role: admin.role,
  };
};

// Deletar Admin
export const deleteAdminService = async (id) => {
  const admin = await Usuario.findByPk(id);
  if (!admin) {
    throw new Error("Administrador não encontrado.");
  }

  await admin.destroy();
  return { message: "Administrador deletado com sucesso." };
};
