import {
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from "../services/adminService.js";
import { loginService } from "../services/authService.js";

// 1. Criar
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

// 2. Login
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

// 3. Editar
export const updateAdmin = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Pega o ID da URL
    const adminAtualizado = await updateAdminService(id_usuario, req.body);
    return res.status(200).json({
      message: "Perfil atualizado com sucesso",
      data: adminAtualizado,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

// 4. Deletar
export const deleteAdmin = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Pega o ID da URL
    await deleteAdminService(id_usuario);
    return res.status(204).send(); // 204 = No Content (Sucesso sem corpo)
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
