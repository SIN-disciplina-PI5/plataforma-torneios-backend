import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
    const User = sequelize.define("User", {
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
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true, notEmpty: true },
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        patente: {
            type: DataTypes.STRING,
            allowNull: false, //a revisar
            validate: {
                notEmpty: true,
            },
        },
        role: {
            type: DataTypes.ENUM("ADMIN", "USER"),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        }
        //sequelize cria createdat e updatedat
    })
    User.beforeCreate(async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
    });
    return User;
}