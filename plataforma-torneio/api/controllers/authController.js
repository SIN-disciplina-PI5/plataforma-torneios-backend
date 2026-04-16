import { loginService, logoutService } from "../services/authService.js";
import { validarRecaptcha } from "../utils/recaptcha.js";

export const login = async (req, res) => {
  try {
    const { email, senha, recaptchaToken } = req.body;
    await validarRecaptcha(recaptchaToken);
    const token = await loginService(email, senha);
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(401).json({ error: e.message });
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