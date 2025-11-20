const getEquipeUsuarioModel = (sequelize, { DataTypes }) => {
  const EquipeUsuario = sequelize.define("EquipeUsuario", {

    id_equipe_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_equipe: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Equipe',
        key: 'id_equipe',
      }
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id_usuario',
      }
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
      tableName: "EquipeUsuarios",
  });

  EquipeUsuario.associate = (models) => {
  EquipeUsuario.belongsTo(models.Equipe, {
      foreignKey: 'id_equipe',
      as: 'equipe',
    });
  EquipeUsuario.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario',
    });
  };

  return EquipeUsuario;
};

export default getEquipeUsuarioModel;