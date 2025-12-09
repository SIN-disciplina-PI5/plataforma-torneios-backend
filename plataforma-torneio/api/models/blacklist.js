export default (sequelize, DataTypes) => {
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
