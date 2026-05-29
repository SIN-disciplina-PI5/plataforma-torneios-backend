import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Torneio", {
    id_torneio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Nome do torneio não pode ser vazio");
        }
      } },
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Categoria não pode ser vazia");
        }
      } },
    },
    vagas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notEmpty: true, isInt: true, min: 0, max: 32 },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    turno: {
      type: DataTypes.ENUM("MANHA", "TARDE", "NOITE"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["MANHA", "TARDE", "NOITE"]],
          msg: "Turno inválido",
        },
      },
    },
  });
};
