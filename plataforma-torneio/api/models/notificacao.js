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
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Título não pode ser vazio");
        }
      } },
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Mensagem não pode ser vazia");
        }
      } },
    },
    lida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, notWhitespace(value) {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error("Tipo não pode ser vazio");
        }
      } },
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
