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
        allowNull: true,
      },
    },
    {
      tableName: "Equipes",
    }
  );

  return Equipe;
};