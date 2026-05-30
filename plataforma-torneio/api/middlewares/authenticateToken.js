import "dotenv/config";
import { verificarTokenService } from "../services/authService.js";


export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ error: "Token não fornecido" });
    }

    const [scheme, accessToken] = authHeader.split(" ");
    if (scheme !== "Bearer" || !accessToken) {
      return res.status(403).json({ error: "Formato de token inválido" });
    }

    const decoded = await verificarTokenService(accessToken);
    req.user = decoded;
    return next();
  } catch (e) {
    if (e.message === "Token inválido" || e.message === "Token inválido ou expirado") {
      return res.status(403).json({ error: "Token inválido" });
    }
    return res.status(500).json({ error: e.message });
  }
};