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
        type: DataTypes.DATE
      },
      block_moderation_end_date: {
        type: DataTypes.DATE
      },
      block_is_extended: {
        type: DataTypes.INTEGER(11)
      }
    },
    {
      tableName: "modules_users_assigned",
    }
  );
};
