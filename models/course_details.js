/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course_details', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    course_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    tableName: 'course_details'
  });
};
