import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Ranking", {
      id_ranking: {
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
      },
      pontos_acumulados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      posicao_atual: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ultima_atualizacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Rankings",
      indexes: [
        {
          unique: true,
          fields: ["id_usuario"],
        },
      ],
    }
  );
};
