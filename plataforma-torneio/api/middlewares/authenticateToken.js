import jwt from "jsonwebtoken";
import "dotenv/config";
import models from "../models/index.js";
const { Blacklist } = models;

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ error: 'Token não fornecido' });
        }
        const accessToken = token.split(" ")[1];
        const blackListed = await Blacklist.findOne({ where: { token: accessToken } });
        if (blackListed) {
            return res.status(401).json({ error: "Não autorizado" });
        }
        jwt.verify(accessToken, process.env.MY_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Token inválido" });
            }
            req.user = decoded;
            next();
        })
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}