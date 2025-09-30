import { Sequelize } from "sequelize";
import UserModel from "./user.js";
import TorneioModel from "./torneio.js";

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

const User = UserModel(sequelize);
const Torneio = TorneioModel(sequelize);

//se tiver relacionamentos, define assim:
//Table.hasMany(OtherTable);
//OtherTable.belongsTo(Table);

//torneio e usuario se relacionam por tabela intermediária ainda não criada

export {sequelize, User, Torneio};