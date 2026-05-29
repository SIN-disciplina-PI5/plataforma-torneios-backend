import models from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

const { Usuario, Blacklist } = models;

const limparTokensExpirados = () =>
  Blacklist.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date(),
      },
    },
  });

export const loginService = async (email, senha) => {
  if (!email || !senha) throw new Error("Email e senha são obrigatórios");

  const usuario = await Usuario.findOne({ where: { email: email.toLowerCase() } });
  if (!usuario) throw new Error("Email ou senha inválidos");

  const match = await bcrypt.compare(senha, usuario.senha);
  if (!match) throw new Error("Email ou senha inválidos");

  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      email: usuario.email,
      role: usuario.role,
    },
    process.env.MY_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
  );

  return token;
};

export const verificarTokenService = async (token) => {

  if (!token) throw new Error("Token obrigatório");

  await limparTokensExpirados();

  const tokenBlacklisted = await Blacklist.findOne({
    where: { token },
  });

  if (tokenBlacklisted) throw new Error("Token inválido");

  try {
    return jwt.verify(token, process.env.MY_SECRET);
  } catch {
    throw new Error("Token inválido ou expirado");
  }
};

export const logoutService = async (token) => {
  const decoded = jwt.verify(token, process.env.MY_SECRET);

  await limparTokensExpirados();

  await Blacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return {
    message: "Logout realizado com sucesso",
  };
};
