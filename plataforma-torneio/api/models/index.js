import "dotenv/config";
import { Sequelize } from "sequelize";
import UsuarioModel from "./user.js";
import TorneioModel from "./torneio.js";
import BlacklistModel from "./blacklist.js";
import { DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  dialectModule: require("pg"),
});

const Usuario = UsuarioModel(sequelize, DataTypes);
const Torneio = TorneioModel(sequelize, DataTypes);
const Blacklist = BlacklistModel(sequelize, DataTypes);

//se tiver relacionamentos, define assim:
//Table.hasMany(OtherTable);
//OtherTable.belongsTo(Table);

//torneio e usuario se relacionam por tabela intermediária ainda não criada

export default { sequelize, Usuario, User: Usuario, Torneio, Blacklist };
