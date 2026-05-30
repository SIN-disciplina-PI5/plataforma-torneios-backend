import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notWhitespace(value) {
          if (typeof value !== "string" || !value.trim()) {
            throw new Error("Nome não pode ser vazio");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
        notWhitespace(value) {
          if (typeof value !== "string" || !value.trim()) {
            throw new Error("Email não pode ser vazio");
          }
        },
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notWhitespace(value) {
          if (typeof value !== "string" || !value.trim()) {
            throw new Error("Senha não pode ser vazia");
          }
        },
      },
    },
    patente: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "USER"),
      allowNull: false,
      validate: { notEmpty: true },
    },
    foto_perfil: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Usuario.beforeCreate(async (usuario) => {
    usuario.senha = await bcrypt.hash(usuario.senha, 12);
    if (!usuario.role) {
      usuario.role = "USER";
    }
  });

  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed("senha")) {
      usuario.senha = await bcrypt.hash(usuario.senha, 12);
    }
  });

  return Usuario;
};
