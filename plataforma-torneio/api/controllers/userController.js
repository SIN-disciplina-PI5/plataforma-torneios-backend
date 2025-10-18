import "dotenv/config";
import models from "../models/index.js";
const { User, Blacklist } = models;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const login = async (req, res) => {

    try {
        const { email, senha } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign({ id: user.id_usuario, email: user.email, role: user.role }, process.env.MY_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });
        return res.status(200).json({ token });
    } catch (e) {
        return res.status(500).json({ error: e.message || "Erro ao tentar fazer login" });
    }
}

export const logout = async (req, res) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ error: "Não autorizado" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);
    await Blacklist.create({ token, expiresAt: new Date(decoded.exp * 1000) });
    res.json({ message: "Você deslogou" });
}

export const createUser = async (req, res) => {
    try {
        if (!req.body.nome || !req.body.email || !req.body.senha) {
            return res.status(400).json({ error: "Dados faltando para o cadastro de usuário" });
        }

        const newUser = await User.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            patente: null,
            role: "USER",
        });
        const token = jwt.sign({ id: newUser.id_usuario, email: newUser.email, role: newUser.role }, process.env.MY_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });
        const { senha, ...safeUser } = newUser.toJSON();
        return res.status(201).json({ message: "Usuário criado", data: { newUser: safeUser, token: token }, });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e.message || "Erro ao cadastrar usuário" });
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.params.id_usuario;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        await user.update(req.body);
        const { senha, ...safeUser } = user.toJSON();
        return res.status(200).json(safeUser);
    } catch (e) {
        return res.status(500).json({ error: e.message || "Erro ao atualizar usuário" });
    }
}

