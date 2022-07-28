let config = {
  host: process.env.Host,
  user: process.env.Databaseuser,
  password: process.env.Databasepassword,
  database: process.env.Database,
  port: "3306",
    dialect:"mysql",
    min:0,
    max:5,
    idle:10000,
    dirPath:"../models"
};

module.exports = config;