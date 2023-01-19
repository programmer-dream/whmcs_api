/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_block_intakes",
    {
      unique_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      teaching_block_period_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      teaching_block_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
    },
    {
      tableName: "teaching_block_intakes",
    }
  );
};
