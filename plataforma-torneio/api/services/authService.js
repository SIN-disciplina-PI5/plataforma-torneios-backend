import models from "../models/index.js";
const { Usuario, Blacklist } = models;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const loginService = async (email, senha) => {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario)
    throw new Error("Email ou senha inválidos");

  const match = await bcrypt.compare(senha, usuario.senha);

  if (!match)
    throw new Error("Email ou senha inválidos");

  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      email: usuario.email,
      role: usuario.role
    },
    process.env.MY_SECRET,
    {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN)
    }
  );

  return token;
};

export const verificarTokenService = async (token) => {
  if (!token)
    throw new Error("Token obrigatório");

  const tokenBlacklisted = await Blacklist.findOne({
    where: { token }
  });

  if (tokenBlacklisted)
    throw new Error("Token inválido");

  try {
    return jwt.verify(token, process.env.MY_SECRET);
  } catch {
    throw new Error("Token inválido ou expirado");
  }
};

export const logoutService = async (token) => {
  const decoded = jwt.verify(token, process.env.MY_SECRET);

  await Blacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000)
  });

  return {
    message: "Você deslogou"
  };
};