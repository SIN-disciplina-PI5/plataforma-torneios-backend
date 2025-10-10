import { User } from "../models/user.js";
import "dotenv/config";
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

export const createUser = async (req, res) => {
    try {
        if (!req.body.nome || !req.body.email || !req.body.senha) {
            return res.status(400).json({ error: "Dados faltando para o cadastro de usuário" });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(req.body.senha, saltRounds);

        const newUser = await User.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: hashedPassword,
            patente: null,
            role: "USER",
        });
        const token = jwt.sign({ id: newUser.id_usuario, email: newUser.email, role: newUser.role }, process.env.MY_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });
        const {senha, ...safeUser} = newUser.toJSON();
        return res.status(201).json({ message: "Usuário criado", data: { newUser: safeUser, token: token }, });
    } catch (e) {
        return res.status(500).json({ error: e.message || "Erro ao cadastrar usuário"});
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.params.id_usuario;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        if (req.body.senha) {
            req.body.senha = await bcrypt.hash(req.body.senha, 12);
        }
        await user.update(req.body);
        const { senha, ...safeUser } = user.toJSON();
        return res.status(200).json(safeUser);
    } catch (e) {
        return res.status(500).json({ error: e.message || "Erro ao atualizar usuário" });
    }
}

