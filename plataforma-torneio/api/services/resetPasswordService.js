import models from "../models/index.js";
import { sendResetPasswordEmail } from "./emailService.js";
import crypto from "crypto";

const { Usuario } = models;
const RESET_PASSWORD_SUCCESS_MESSAGE = "Se o email estiver cadastrado, um codigo sera enviado";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const forgotPasswordService = async (email) => {
  if (!email)
    throw new Error("Email é obrigatório");

  const usuario = await Usuario.findOne({
    where: { email }
  });

  if (!usuario) {
    return {
      message: RESET_PASSWORD_SUCCESS_MESSAGE
    };
  }

  const resetToken = crypto.randomInt(100000, 1000000).toString();

  usuario.reset_password_token = hashResetToken(resetToken);
  usuario.reset_password_expires = new Date(Date.now() + 3600000);

  await usuario.save();

  await sendResetPasswordEmail(email, resetToken);

  return {
    message: RESET_PASSWORD_SUCCESS_MESSAGE
  };
};

export const resetPasswordService = async (token, novaSenha) => {
  if (!token)
    throw new Error("Código obrigatório");

  if (!novaSenha)
    throw new Error("Nova senha obrigatória");

  const usuario = await Usuario.findOne({
    where: {
      reset_password_token: hashResetToken(token)
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
