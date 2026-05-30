import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Partida", {
    id_partida: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_torneio: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Torneios",
        key: "id_torneio",
      },
    },
    fase: {
      type: DataTypes.ENUM(
        "OITAVAS_DE_FINAL",
        "QUARTAS_DE_FINAL",
        "SEMI_FINAL",
        "FINAL"
      ),
      allowNull: false,
      validate: { notEmpty: true },
    },
    status: {
      type: DataTypes.ENUM("PENDENTE", "EM_ANDAMENTO", "FINALIZADA"),
      allowNull: false,
      validate: { notEmpty: true },
    },
    horario: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    placar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vencedor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Equipes",
        key: "id_equipe",
      },
    },
    resultado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });
};