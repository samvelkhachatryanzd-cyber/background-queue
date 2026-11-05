module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define(
    'Delivery',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      campaignId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      subscriberId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { tableName: 'deliveries', underscored: true, updatedAt: false }
  );

  return Delivery;
};
