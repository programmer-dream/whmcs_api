/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "user_idpdetails",
    {
      ID: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      student_id: {
        type: DataTypes.STRING(100)
      },
      email: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      sessionid: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      universityid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "1",
      },
      isStaff: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "1",
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      logins: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "1",
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      is_approved_staff: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
      },
      is_admin: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
      },
      is_synced: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
      },
      to_be_deleted: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
      },
      teaching_block_period_id: {
        type: DataTypes.INTEGER(11)
      },
      user_location_id: {
        type: DataTypes.INTEGER(11)
      },
    },
    {
      tableName: "user_idpdetails",
    }
  );
};
