import "dotenv/config";
import cors from "cors";
import express from "express";
import models from "./models/index.js";
import routes from "./routes/index.js";

const app = express();
app.set("trust proxy", true);

var corsOptions = {
  origin: ["http://example.com", "*"],
  optionsSuccessStatus: 200, 
};
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api", routes);

const port = process.env.PORT ?? 3000;

const eraseDatabaseOnSync = true;
models.sequelize.sync({ force: eraseDatabaseOnSync })
  .then(() => console.log("Banco sincronizado e tabelas criadas"))
  .catch(err => console.error("Erro ao sincronizar banco:", err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
console.log(`Listening on port ${port}, access via Codespaces URL`);