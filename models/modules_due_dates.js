/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "modules_due_dates",
    {
      unique_id : {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      module_id : {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      modules_due_date : {
        type: DataTypes.DATE,
        allowNull: false
      },
    },
    {
      tableName: "modules_due_dates",
    }
  );
};
