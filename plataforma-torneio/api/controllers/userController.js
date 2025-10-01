import { User } from "../models/user.js";
import "dotenv/config";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const login = async (req, res) =>{
    const {email, senha} = req.body;
    
    //busca usuário a partir do email
    const user = await User.findOne({ where: { email } });
    
    //verifica se existe usuário (a partir do email)
    if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    //compara a senha enviada com a senha do usuário acima, e se não bater da unauthorized
    const match = await bcrypt.compare(senha, user.senha);
    if (!match){
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    } 

    //assina o token passando o payload, a chave do backend e define que expira em 1 hora
    const token = jwt.sign({id: user.id_usuario, email: user.email, role: user.role}, process.env.MY_SECRET, { expiresIn: '1h'});
    res.status(200).json({token});
}

