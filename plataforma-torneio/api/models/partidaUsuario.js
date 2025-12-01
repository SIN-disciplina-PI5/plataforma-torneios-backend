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
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status_individual: { 
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
};
