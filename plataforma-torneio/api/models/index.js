import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";
import UsuarioModel from "./user.js";
import TorneioModel from "./torneio.js";
import BlacklistModel from "./blacklist.js";
import getEquipeModel from "./equipe.js";
import getEquipeUsuarioModel from "./equipeUsuario.js";

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const models = {};

// Inicializa os modelos que existem
models.Usuario = UsuarioModel(sequelize, DataTypes);
models.Torneio = TorneioModel(sequelize, DataTypes);
models.Blacklist = BlacklistModel(sequelize, DataTypes);
models.Equipe = getEquipeModel(sequelize, { DataTypes });
models.EquipeUsuario = getEquipeUsuarioModel(sequelize, { DataTypes });

models.User = models.Usuario; // Alias
models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
