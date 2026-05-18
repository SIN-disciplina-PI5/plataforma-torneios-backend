import models from "../models/index.js";
import { sendResetPasswordEmail } from "./emailService.js";

const { Usuario } = models;

export const forgotPasswordService = async (email) => {
  if (!email)
    throw new Error("Email é obrigatório");

  const usuario = await Usuario.findOne({
    where: { email }
  });

  if (!usuario)
    throw new Error("Email não encontrado");

  const resetToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  usuario.reset_password_token = resetToken;
  usuario.reset_password_expires = new Date(Date.now() + 3600000);

  await usuario.save();

  await sendResetPasswordEmail(email, resetToken);

  return {
    message: "Código enviado"
  };
};

export const resetPasswordService = async (token, novaSenha) => {
  if (!token)
    throw new Error("Código obrigatório");

  if (!novaSenha)
    throw new Error("Nova senha obrigatória");

  const usuario = await Usuario.findOne({
    where: {
      reset_password_token: token
    }
  });

  if (!usuario)
    throw new Error("Código inválido");

  if (usuario.reset_password_expires < new Date())
    throw new Error("Código expirado");

  usuario.senha = novaSenha;
  usuario.reset_password_token = null;
  usuario.reset_password_expires = null;

  await usuario.save();

  return {
    message: "Senha redefinida"
  };
};