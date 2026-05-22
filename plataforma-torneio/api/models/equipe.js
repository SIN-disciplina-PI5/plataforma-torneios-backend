import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Equipe = sequelize.define("Equipe", {
    id_equipe: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Nome da equipe não pode ser vazio");
        }
      } },
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
  },
  {
    tableName: "Equipes",
  });

  return Equipe;
};
