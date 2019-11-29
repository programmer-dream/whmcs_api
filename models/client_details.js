/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('client_details', {
    universityid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    domainname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CompanyName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Address1: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Address2: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    City: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    State: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Postcode: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    APIkey: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'client_details'
  });
};
