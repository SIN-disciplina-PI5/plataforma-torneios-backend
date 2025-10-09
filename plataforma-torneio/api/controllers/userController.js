import { User } from "../models/user.js";
import "dotenv/config";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const login = async (req, res) => {

    try {
        const { email, senha } = req.body;
        //busca usuário a partir do email
        const user = await User.findOne({ where: { email } });
        //veriFfica se existe usuário (a partir do email)
        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        //compara a senha enviada com a senha do usuário acima, e se não bater da unauthorized
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        //assina o token passando o payload, a chave do backend e define que expira em 1 hora
        const token = jwt.sign({ id: user.id_usuario, email: user.email, role: user.role }, process.env.MY_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (e) {
        res.status(400).json({
            error: e.message,
        });
    }
}

export const createUser = async (req, res) => {
    try {
        if (!req.body.nome || !req.body.email || !req.body.senha) {
            throw new Error("Dados faltando para o cadastro de usuário");
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
        res.status(201).json({
            message: "Usuário criado",
            data: { newUser: newUser, token: token },
        });
    } catch (e) {
        res.status(400).json({
            error: e.message,
        });
    }
}

