/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('courses_modules_assigned', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    teaching_block_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'courses_modules_assigned'
  });
};
