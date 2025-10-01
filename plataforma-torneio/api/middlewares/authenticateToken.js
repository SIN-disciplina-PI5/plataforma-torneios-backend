import jwt from "jsonwebtoken";
import "dotenv/config";

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token){
        return res.status(403).json({error: 'Token não fornecido'});
    }
    jwt.verify(token, process.env.MY_SECRET ,(err, user) => {
        if(err){
            res.status(403).json({error: "Token inválido"});
        }
        req.user = user;
        next();
    })
}