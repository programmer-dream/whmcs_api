/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('module_details', {
    module_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    module_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 0,
    },
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    image: {
        type: DataTypes.BLOB('long')
    },
    number_of_occurance_per_year: {
     type: DataTypes.INTEGER(11),
      allowNull: false
    },
    module_start_date: {
      type: DataTypes.DATE
    },
    module_due_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
    
    

  
  }, {
    tableName: 'module_details'
  });
};
