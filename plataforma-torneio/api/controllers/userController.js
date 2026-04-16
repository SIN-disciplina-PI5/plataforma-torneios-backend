import {
  createUsuarioService,
  getAllUsuariosService,
  getUsuarioByIdService,
  updateUsuarioService,
  deleteUsuarioService,
} from "../services/userService.js";

export const createUsuario = async (req, res) => {
  try {
    const result = await createUsuarioService(req.body);
    return res.status(201).json({
      message: "Usuário criado",
      data: result,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await getAllUsuariosService();
    return res.status(200).json({ data: usuarios });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const usuario = await getUsuarioByIdService(req.params.id_usuario);
    return res.status(200).json({ data: usuario });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const usuario = await updateUsuarioService(req.params.id_usuario, req.body);
    return res.status(200).json({
      message: "Perfil atualizado com sucesso",
      data: usuario,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    await deleteUsuarioService(req.params.id_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};


