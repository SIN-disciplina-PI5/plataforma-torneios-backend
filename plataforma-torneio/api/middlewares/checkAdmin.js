import jwt from "jsonwebtoken";

const checkAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido." });

  try {
    const decoded = jwt.verify(token, process.env.MY_SECRET);

    // Garante que é ADMIN
    if (decoded.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Acesso restrito a administradores." });
    }

    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido." });
  }
};

export default checkAdmin;
