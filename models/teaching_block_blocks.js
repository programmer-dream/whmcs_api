/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_block_blocks",
    {
      teaching_block_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT('tiny'),
        allowNull: false,
      },
      tb_start_date_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      tb_end_date_time: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    },
    {
      tableName: "teaching_block_blocks",
    }
  );
};
