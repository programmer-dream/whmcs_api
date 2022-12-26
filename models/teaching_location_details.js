/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teaching_location_details",
    {
      unique_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      teaching_location_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      address_line_1: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      address_line_2: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      address_line_3: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      country: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      postcode: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.BLOB('long')
      },
      ip_address_id: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_active: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      tableName: "teaching_location_details",
    }
  );
};
