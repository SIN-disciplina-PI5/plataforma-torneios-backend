import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { gerarToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existe = await User.findOne({ where: { email } });

    if (existe) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const novoUsuario = await User.create({
      name,
      email,
      password: senhaHash,
    });

    const token = gerarToken(novoUsuario);

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: {
        id: novoUsuario.id,
        name: novoUsuario.name,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao cadastrar" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.status(400).json({ message: "Email não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.password);

    if (!senhaCorreta) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    const token = gerarToken(usuario);

    return res.status(200).json({
      message: "Login realizado",
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
};
