import models from "../models/index.js";
import { sendResetPasswordEmail } from "./emailService.js";
import crypto from "crypto";

const { Usuario } = models;
const RESET_PASSWORD_SUCCESS_MESSAGE = "Se o email estiver cadastrado, um código será enviado";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const validarSenhaForte = (senha) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

  if (!regex.test(senha)) {
    throw new Error(
      "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.",
    );
  }
};

export const forgotPasswordService = async (email) => {
  if (!email) throw new Error("Email é obrigatório");

  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) { return { message: RESET_PASSWORD_SUCCESS_MESSAGE, }; }

  const resetToken = crypto.randomInt(100000, 1000000).toString();

  usuario.reset_password_token = hashResetToken(resetToken);
  usuario.reset_password_expires = new Date(Date.now() + 3600000);

  await usuario.save();

  await sendResetPasswordEmail(email, resetToken);

  return {
    message: RESET_PASSWORD_SUCCESS_MESSAGE,
  };
};

export const resetPasswordService = async (token, novaSenha) => {
  if (!token) throw new Error("Código obrigatório");
  if (!novaSenha) throw new Error("Nova senha obrigatória");

  validarSenhaForte(novaSenha);

  const usuario = await Usuario.findOne({
    where: {
      reset_password_token: hashResetToken(token),
    },
  });

  if (!usuario) throw new Error("Código inválido");

  if (usuario.reset_password_expires < new Date()) throw new Error("Código expirado");

  usuario.senha = novaSenha;
  usuario.reset_password_token = null;
  usuario.reset_password_expires = null;

  await usuario.save();

  return {
    message: "Senha redefinida",
  };
};
