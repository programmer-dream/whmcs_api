let config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "williams_app",
  port: "3306",
    dialect:"mysql",
    min:0,
    max:5,
    idle:10000,
    dirPath:"../models"
};

module.exports = config;