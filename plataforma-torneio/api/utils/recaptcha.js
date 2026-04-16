import axios from "axios";

export const validarRecaptcha = async (token) => {
  if (!token) throw new Error("Recaptcha obrigatório");

  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    }
  );

  if (!response.data.success) {
    throw new Error("Falha no recaptcha");
  }

  return true;
};