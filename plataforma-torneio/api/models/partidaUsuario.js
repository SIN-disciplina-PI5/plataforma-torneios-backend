import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("PartidaUsuario", {
    id_partida_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_partida: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Partidas",
        key: "id_partida",
      },
    },
    id_equipe: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Equipes",
        key: "id_equipe",
      },
    },
    status_individual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
};