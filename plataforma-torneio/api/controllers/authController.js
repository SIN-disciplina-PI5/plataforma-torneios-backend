import { loginService, logoutService } from "../services/authService.js";
import { validarRecaptcha } from "../utils/recaptcha.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const login = async (req, res) => {
  try {
    const { email, senha, recaptchaToken } = req.body;
    if (recaptchaToken) {
         await validarRecaptcha(recaptchaToken);
    } 
    if (!recaptchaToken) {
      return res.status(400).json({ error: "Recaptcha obrigatório" });
    }
    const token = await loginService(email, senha);
    return res.status(200).json({ token });
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Não autorizado" });
    const token = authHeader.split(" ")[1];
    const message = await logoutService(token);
    return res.json(message);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};