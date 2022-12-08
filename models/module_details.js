/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('module_details', {
    module_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    module_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module_start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    module_end_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'module_details'
  });
};
