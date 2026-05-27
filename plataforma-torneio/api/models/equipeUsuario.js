import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("EquipeUsuario", {
      id_equipe_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_equipe: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Equipes",
          key: "id_equipe",
        },
      },
      id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id_usuario",
        },
      },
    },
    {
      tableName: "EquipeUsuarios",
      indexes: [
        {
          unique: true,
          fields: ["id_equipe", "id_usuario"],
        },
      ],
    }
  );
};
