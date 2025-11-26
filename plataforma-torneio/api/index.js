import "dotenv/config";
import cors from "cors";
import express from "express";
import models from "./models/index.js";
import routes from "./routes/index.js";

const app = express();
app.set("trust proxy", true);


const corsOptions = {
  origin: ["http://example.com", "*"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('<h1>API do Torneio Funcionando!</h1><p>Acesse as rotas de Torneios, Usuários, etc.</p>');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

if (process.env.NODE_ENV !== "test") {
  const eraseDatabaseOnSync = true;
  models.sequelize.sync({ force: eraseDatabaseOnSync })
    .then(() => console.log("Banco sincronizado e tabelas criadas"))
    .catch(err => console.error("Erro ao sincronizar banco:", err));

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => console.log(`Listening on ${port}`));
}

export default app;