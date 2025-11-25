import { createAdminService } from "../services/adminService.js";
import { loginService } from "../services/authService.js";

export const registerAdmin = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const admin = await createAdminService({ nome, email, senha });

    return res.status(201).json({
      message: "Administrador cadastrado com sucesso!",
      admin,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const token = await loginService(email, senha);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};
