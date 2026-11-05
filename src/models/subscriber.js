module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define(
    'Subscriber',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
    },
    { tableName: 'subscribers', underscored: true }
  );

  return Subscriber;
};
