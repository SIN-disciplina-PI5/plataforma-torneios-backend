import { criarUsuarioService, editarUsuarioService, deletarUsuarioService, } from "../services/userService.js";

export const criarUsuario = async (req, res) => {
  try {
    const result = await criarUsuarioService(req.body);
    return res.status(201).json({ message: "Usuário criado", data: result });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const editarPerfil = async (req, res) => {
  try {
    const usuario = await editarUsuarioService(req.params.id_usuario, req.body);
    return res.status(200).json(usuario);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const deletarPerfil = async (req, res) => {
  try {
    await deletarUsuarioService(req.params.id_usuario);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
