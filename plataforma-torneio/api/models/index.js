import "dotenv/config";
import { Sequelize } from "sequelize";
import pg from "pg";

import UsuarioModel from "./user.js";
import TorneioModel from "./torneio.js";
import BlacklistModel from "./blacklist.js";
import InscricaoModel from "./inscricao.js";
import PartidaModel from "./partida.js";
import EquipeModel from "./equipe.js";
import EquipeUsuarioModel from "./equipeUsuario.js";
import RankingModel from "./ranking.js";
import PartidaUsuarioModel from "./partidaUsuario.js";

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions:
    process.env.NODE_ENV === "test" ? {} : {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
  dialectModule: pg,
  logging: false,
});

const Usuario = UsuarioModel(sequelize);
const Torneio = TorneioModel(sequelize);
const Inscricao = InscricaoModel(sequelize);
const Blacklist = BlacklistModel(sequelize);
const Equipe = EquipeModel(sequelize);
const EquipeUsuario = EquipeUsuarioModel(sequelize);
const Ranking = RankingModel(sequelize);
const Partida = PartidaModel(sequelize);
const PartidaUsuario = PartidaUsuarioModel(sequelize);

/* RELACIONAMENTOS */

Usuario.belongsToMany(Equipe, {
  through: EquipeUsuario,
  foreignKey: "id_usuario",
  otherKey: "id_equipe",
  as: "equipes",
});

Equipe.belongsToMany(Usuario, {
  through: EquipeUsuario,
  foreignKey: "id_equipe",
  otherKey: "id_usuario",
  as: "membros",
});

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
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inscricao.belongsTo(Torneio, {
  foreignKey: "id_torneio",
});

Usuario.hasOne(Ranking, {
  foreignKey: "id_usuario",
  as: "ranking",
});

Ranking.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
});

Partida.belongsTo(Torneio, {
  foreignKey: "id_torneio",
});

Torneio.hasMany(Partida, {
  foreignKey: "id_torneio",
});

Partida.hasMany(PartidaUsuario, {
  foreignKey: "id_partida",
  as: "equipesPartida",
});

PartidaUsuario.belongsTo(Partida, {
  foreignKey: "id_partida",
  as: "partida",
});

Equipe.hasMany(PartidaUsuario, {
  foreignKey: "id_equipe",
  as: "partidasEquipe",
});

PartidaUsuario.belongsTo(Equipe, {
  foreignKey: "id_equipe",
  as: "equipe",
});

export default {
  Usuario,
  Torneio,
  Inscricao,
  Blacklist,
  Equipe,
  EquipeUsuario,
  Ranking,
  Partida,
  PartidaUsuario,
};

export { sequelize };