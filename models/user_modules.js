/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_modules', {
    userid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    module1: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module2: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module3: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module4: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module5: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module6: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'user_modules'
  });
};
