import models from "../models/index.js";
import bcrypt from "bcrypt";
import { sendResetPasswordEmail } from "./emailService.js";

const { Usuario } = models;

export const forgotPasswordService = async (email) => {
  if (!email) {
    throw new Error("Email é obrigatório");
  }

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    throw new Error("Email não encontrado");
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpires = new Date(Date.now() + 3600000);

  usuario.reset_password_token = resetToken;
  usuario.reset_password_expires = resetExpires;
  await usuario.save();

  await sendResetPasswordEmail(email, resetToken);

  return { message: "Código de recuperação enviado para seu email" };
};

export const resetPasswordService = async (token, novaSenha) => {
  if (!token) {
    throw new Error("Código é obrigatório");
  }

  if (!novaSenha) {
    throw new Error("Nova senha é obrigatória");
  }

  if (novaSenha.length < 6) {
    throw new Error("Senha deve ter no mínimo 6 caracteres");
  }

  const usuario = await Usuario.findOne({
    where: {
      reset_password_token: token,
    },
  });

  if (!usuario) {
    throw new Error("Código inválido");
  }

  if (usuario.reset_password_expires < new Date()) {
    throw new Error("Código expirado");
  }

  usuario.senha = await bcrypt.hash(novaSenha, 12);
  usuario.reset_password_token = null;
  usuario.reset_password_expires = null;
  await usuario.save();

  return { message: "Senha redefinida com sucesso" };
};