/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_block_period_description",
    {
      teaching_block_period_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      teaching_block_period_description: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      }
    },
    {
      tableName: "teaching_block_period_description",
    }
  );
};
