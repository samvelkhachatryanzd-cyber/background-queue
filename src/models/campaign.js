module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    'Campaign',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft' },
      sentAt: { type: DataTypes.DATE, allowNull: true },
      failureMessage: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    },
    { tableName: 'campaigns', underscored: true }
  );

  return Campaign;
};
