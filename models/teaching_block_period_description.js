/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_block_intake_description",
    {
      teaching_block_period_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      teaching_block_period_description: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      intake_start_date: {
        type: DataTypes.DATE
      },
      intake_end_date: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: "teaching_block_intake_description",
    }
  );
};
