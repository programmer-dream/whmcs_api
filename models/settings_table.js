/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "settings_table",
    {
      unique_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      university_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      teaching_block_enabled: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
      }
    },
    {
      tableName: "settings_table",
    }
  );
};
