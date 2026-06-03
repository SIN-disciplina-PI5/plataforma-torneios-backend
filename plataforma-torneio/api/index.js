import "dotenv/config";
import cors from "cors";
import express from "express";
import * as models from "./models/index.js";
import routes from "./routes/index.js";

const app = express();

if (process.env.NODE_ENV !== "test") {
  app.set("trust proxy", true);
}

//const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];

//app.use(cors({ origin: allowedOrigins,}),);
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use("/api", routes);

if (process.env.NODE_ENV !== "test") {
  models.sequelize
    .sync()
    .then(() => console.log("Banco sincronizado"))
    .catch(console.error);

  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

export default app;