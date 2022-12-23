/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_location_ip_addresses",
    {
      ip_address_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      teaching_location_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:1
      },
      ip_address_v4: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ip_address_v6: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "teaching_location_ip_addresses",
    }
  );
};
