import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";

import UsuarioModel from "./user.js";
import TorneioModel from "./torneio.js";
import BlacklistModel from "./blacklist.js";
import InscricaoModel from "./inscricao.js";
import PartidaModel from "./partida.js";
import getEquipeModel from "./equipe.js";
import getEquipeUsuarioModel from "./equipeUsuario.js";
import getRankingModel from "./ranking.js";
import partidaUsuarioModel from "./partidaUsuario.js"

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  dialectModule: pg,
  logging: false,
});

const Usuario = UsuarioModel(sequelize);
const Torneio = TorneioModel(sequelize);
const Inscricao = InscricaoModel(sequelize);
const Blacklist = BlacklistModel(sequelize, DataTypes);
const Equipe = getEquipeModel(sequelize, { DataTypes });
const EquipeUsuario = getEquipeUsuarioModel(sequelize, { DataTypes });
const Ranking = getRankingModel(sequelize, { DataTypes });
const Partida = PartidaModel(sequelize);
const PartidaUsuario = partidaUsuarioModel(sequelize, DataTypes); 
// Relacionamentos

Usuario.belongsToMany(Equipe, {
  through: EquipeUsuario,
  foreignKey: "id_usuario",
  otherKey: "id_equipe",
  as: "equipes", // Permite: usuario.getEquipes()
});

Equipe.belongsToMany(Usuario, {
  through: EquipeUsuario,
  foreignKey: "id_equipe",
  otherKey: "id_usuario",
  as: "membros", // Permite: equipe.getMembros()
});

EquipeUsuario.belongsTo(Equipe, { foreignKey: "id_equipe", as: "equipe" });
EquipeUsuario.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });

Equipe.hasMany(Inscricao, {
  foreignKey: "id_equipe",
  as: "inscricoes",
});
Inscricao.belongsTo(Equipe, {
  foreignKey: "id_equipe",
  as: "equipe",
});

Torneio.hasMany(Inscricao, {
  foreignKey: "id_torneio",
  as: "inscricoes",
});
Inscricao.belongsTo(Torneio, {
  foreignKey: "id_torneio",
  as: "torneio",
});

Partida.belongsTo(Torneio, { foreignKey: "id_torneio" });
Torneio.hasMany(Partida, { foreignKey: "id_torneio" });



//ranking

Usuario.hasOne(Ranking, {
  foreignKey: "id_usuario",
  as: "ranking",
});

Ranking.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
});

// partida

Partida.belongsTo(Torneio, {
   foreignKey: "id_torneio" 
  });

  Torneio.hasMany(Partida, {
     foreignKey: "id_torneio"
     });

     
Partida.hasMany(PartidaUsuario, { foreignKey: "id_partida" });
PartidaUsuario.belongsTo(Partida, { foreignKey: "id_partida" });

Usuario.hasMany(PartidaUsuario, { foreignKey: "id_usuario" });
PartidaUsuario.belongsTo(Usuario, { foreignKey: "id_usuario" });

export default {
  Usuario,
  Torneio,
  Inscricao,
  Blacklist,
  Equipe,
  EquipeUsuario,
  Ranking,
  Partida,
  PartidaUsuario
}

export {sequelize};
