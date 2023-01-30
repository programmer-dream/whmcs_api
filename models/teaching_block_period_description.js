/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_block_intake_description",
    {
      teaching_block_period_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      teaching_block_period_description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      intake_start_date: {
        type: DataTypes.STRING(150)
      },
      intake_end_date: {
        type: DataTypes.STRING(150)
      }
    },
    {
      tableName: "teaching_block_intake_description",
    }
  );
};
