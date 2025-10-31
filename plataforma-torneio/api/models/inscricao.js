import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Inscricao = sequelize.define("Inscricao", {
    id_inscricao: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_equipe: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Equipe",
        key: "id_equipe",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    id_torneio: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Torneio",
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
      type: DataTypes.ENUM("AGUARDANDO", "APPRODA", "REJEITADA"),
      allowNull: false,
      defaultValue: "AGUARDANDO",
    },
  });
  return Inscricao;
};
