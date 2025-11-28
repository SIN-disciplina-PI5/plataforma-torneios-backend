const getEquipeModel = (sequelize, { DataTypes }) => {
  const Equipe = sequelize.define(
    "Equipe",
    {
      id_equipe: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Equipes",
    }
  );

  // Associação: Uma Equipe tem vários usuários vinculados
  Equipe.associate = (models) => {
    Equipe.hasMany(models.EquipeUsuario, {
      foreignKey: "id_equipe",
      as: "membros",
    });
  };

  return Equipe;
};

export default getEquipeModel;
