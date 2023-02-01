/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "modules_users_assigned",
    {
      unique_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      block_moderation_start_date: {
        type: DataTypes.STRING(150)
      },
      block_moderation_end_date: {
        type: DataTypes.STRING(150)
      },
      block_is_extended: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      is_block_resit_enabled: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: "modules_users_assigned",
    }
  );
};
