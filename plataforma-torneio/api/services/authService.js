import models from "../models/index.js";
const { User, Blacklist } = models;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const loginService = async (email, senha) => {
  const usuario = await User.findOne({ where: { email } });
  if (!usuario) throw new Error("Usuário ou senha inválidos");

  const match = await bcrypt.compare(senha, usuario.senha);
  if (!match) throw new Error("Usuário ou senha inválidos");

  const token = jwt.sign(
    { id: usuario.id_usuario, email: usuario.email, role: usuario.role },
    process.env.MY_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) }
  );
  return token;
};

export const logoutService = async (token) => {
  const decoded = jwt.decode(token);
  await Blacklist.create({ token, expiresAt: new Date(decoded.exp * 1000) });
  return { message: "Você deslogou" };
};