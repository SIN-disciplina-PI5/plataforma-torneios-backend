import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Blacklist", {
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};