export default (sequelize, DataTypes) => {
  const Notificacao = sequelize.define("Notificacao", {
    id_notificacao: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Notificacao.associate = (models) => {
    Notificacao.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  };

  return Notificacao;
};