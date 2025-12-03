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
    },
    fase: {
      type: DataTypes.ENUM("GRUPOS", "OITAVAS_DE_FINAL", "QUARTAS_DE_FINAL", "SEMI_FINAL", "FINAL"),
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
      type: DataTypes.STRING, //ex: "2-1"
      allowNull: true,
    },
    vencedor_id: {
      type: DataTypes.UUID, //fk pra Equipe.id_equipe (equipe vencedora)
      allowNull: true,
    },
    resultado: {
      type: DataTypes.TEXT, //descrição opcional do resultado
      allowNull: true,
    },
  });
};

