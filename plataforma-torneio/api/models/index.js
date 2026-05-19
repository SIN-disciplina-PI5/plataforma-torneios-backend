import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";
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
import NotificacaoModel from "./notificacao.js";

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions:
    process.env.NODE_ENV === "test"
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
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
const Notificacao = NotificacaoModel(sequelize, DataTypes);

Usuario.belongsToMany(Equipe, {
  through: EquipeUsuario,
  foreignKey: "id_usuario",
  otherKey: "id_equipe",
  as: "equipes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Equipe.belongsToMany(Usuario, {
  through: EquipeUsuario,
  foreignKey: "id_equipe",
  otherKey: "id_usuario",
  as: "membros",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Usuario.hasMany(Inscricao, {
  foreignKey: "id_usuario",
  as: "inscricoes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inscricao.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Torneio.hasMany(Inscricao, {
  foreignKey: "id_torneio",
  as: "inscricoes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inscricao.belongsTo(Torneio, {
  foreignKey: "id_torneio",
  as: "torneio",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Torneio.hasMany(Equipe, {
  foreignKey: "id_torneio",
  as: "equipes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Equipe.belongsTo(Torneio, {
  foreignKey: "id_torneio",
  as: "torneio",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Usuario.hasOne(Ranking, {
  foreignKey: "id_usuario",
  as: "ranking",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Ranking.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Torneio.hasMany(Partida, {
  foreignKey: "id_torneio",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Partida.belongsTo(Torneio, {
  foreignKey: "id_torneio",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Partida.hasMany(PartidaUsuario, {
  foreignKey: "id_partida",
  as: "equipesPartida",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PartidaUsuario.belongsTo(Partida, {
  foreignKey: "id_partida",
  as: "partida",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Equipe.hasMany(PartidaUsuario, {
  foreignKey: "id_equipe",
  as: "partidasEquipe",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PartidaUsuario.belongsTo(Equipe, {
  foreignKey: "id_equipe",
  as: "equipe",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Usuario.hasMany(Notificacao, {
  foreignKey: "id_usuario",
  as: "notificacoes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Notificacao.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
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
  Notificacao,
};

export { sequelize };