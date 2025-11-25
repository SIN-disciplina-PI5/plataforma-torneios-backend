import {
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from "../services/adminService.js";
import { loginService } from "../services/authService.js";
import jwt from "jsonwebtoken";

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

    // Decodifica o token para pegar os dados do usuário
    const decoded = jwt.decode(token);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const adminAtualizado = await updateAdminService(id_usuario, req.body);
    return res.status(200).json({
      message: "Perfil atualizado com sucesso",
      data: adminAtualizado,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    await deleteAdminService(id_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
