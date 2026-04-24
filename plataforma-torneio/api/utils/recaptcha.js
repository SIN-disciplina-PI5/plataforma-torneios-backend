import axios from "axios";
import qs from "qs";

export const validarRecaptcha = async (token) => {
  if (!token) throw new Error("Recaptcha obrigatório");

  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    qs.stringify({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  console.log("RECAPTCHA RESPONSE:", response.data);

  if (!response.data.success) {
    throw new Error(
      "Falha no recaptcha: " + JSON.stringify(response.data["error-codes"])
    );
  }

  return true;
};