const getEquipeUsuarioModel = (sequelize, { DataTypes }) => {
  const EquipeUsuario = sequelize.define("EquipeUsuario", {

    // definir os atributos
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });


  // DEFINIR SE TERÁ RELACIONAMENTOS
  EquipeUsuario.associate = (models) => {
    EquipeUsuario.belongsTo(models.user);
  };

  return EquipeUsuario;
};

export default getEquipeUsuarioModel;