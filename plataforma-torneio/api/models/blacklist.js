export default (sequelize, DataTypes) => {
  return sequelize.define("Blacklist", {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};
