import { Sequelize } from "sequelize";
import UsuarioModel from "./user.js";
import TorneioModel from "./torneio.js";
import BlacklistModel from "./blacklist.js";
import InscricaoModel from "./inscricao.js";
import pg from "pg";
import "dotenv/config";
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
  dialectModule: pg,
});

const Usuario = UsuarioModel(sequelize, DataTypes);
const Torneio = TorneioModel(sequelize, DataTypes);
const Blacklist = BlacklistModel(sequelize, DataTypes);
const Inscricao = InscricaoModel(sequelize, DataTypes);

//se tiver relacionamentos, define assim:
//Table.hasMany(OtherTable);
//OtherTable.belongsTo(Table);

//torneio e usuario se relacionam por tabela intermediária ainda não criada

export default { sequelize, Usuario, Torneio, Blacklist, Inscricao };
