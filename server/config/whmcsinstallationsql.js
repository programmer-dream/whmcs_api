let config = {
    host: process.env.whmcshost,
    user: process.env.whmcsuser,
    password: process.env.whmcsdatabasepassword,
    database: process.env.whmcsdatabasename,
    port: process.env.whmcsdatabaseport
};
module.exports = config;