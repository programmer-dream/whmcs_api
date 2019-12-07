/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('client_availablemodules', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    },
    module7: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    universityid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'client_availablemodules'
  });
};
