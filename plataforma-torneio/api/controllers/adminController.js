import { createAdminService } from "../services/adminService.js";
import { loginService } from "../services/authService.js";

export const registerAdmin = async (req, res) => {
  try {
    const admin = await createAdminService(req.body);

    return res.status(201).json({
      message: "Administrador criado com sucesso",
      data: admin,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const token = await loginService(req.body.email, req.body.senha);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
    });
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
};
