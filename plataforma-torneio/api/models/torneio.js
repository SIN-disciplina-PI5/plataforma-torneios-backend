import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define("Torneio", {
        id_torneio: {
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
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        vagas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { notEmpty: true, isInt: true, min: 0, max: 64 },
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        fases: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        }
    })
}