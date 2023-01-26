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
        type: DataTypes.BOOLEAN(1),
        allowNull: false,
      },
      module_courses_enabled: {
        type: DataTypes.BOOLEAN(1),
        allowNull: false,
      },
      module_date_enabled: {
        type: DataTypes.BOOLEAN(1),
        allowNull: false,
      },
      extension_duration: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:7
      },
      marking_duration: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      cron_running_date: {
        type: DataTypes.DATE
      },
      block_extension_duration: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      block_marking_duration: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      block_module_in_moderation: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      block_cron_running: {
        type: DataTypes.DATE
      },
      block_resit_duration: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      home_page_text: {
        type: DataTypes.TEXT
      },
      dashboard_page_text: {
        type: DataTypes.TEXT
      },
      student_account_text: {
        type: DataTypes.TEXT
      },
      staff_account_notes: {
        type: DataTypes.TEXT
      },
      csv_invalid_message: {
        type: DataTypes.TEXT
      },
      tbc_txt: {
        type: DataTypes.TEXT
      }
    },
    {
      tableName: "settings_table",
    }
  );
};
