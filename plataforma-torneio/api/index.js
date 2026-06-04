import "dotenv/config";
import cors from "cors";
import express from "express";
import * as models from "./models/index.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", true);

const allowedOrigins = process.env.CORS_ORIGINS?.split(",").map((origin) =>
  origin.trim()
) || [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem nao permitida pelo CORS"));
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use("/api", routes);

models.sequelize
  .sync()
  .then(() => console.log("Banco sincronizado"))
  .catch(console.error);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

export default app;
