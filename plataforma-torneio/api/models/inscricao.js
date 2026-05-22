import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Inscricao", {
    id_inscricao: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "id_usuario",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    id_torneio: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Torneios",
        key: "id_torneio",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    data_inscricao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Inscricoes",
  });
};