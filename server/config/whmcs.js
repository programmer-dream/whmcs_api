const config = {
// CONFIGURATION
identifier: process.env.whmcsidentifier,
secret: process.env.whmcssecret,
serverUrl: process.env.whmcsserverUrl, // Remember to point to the api.php file

    // Account name of the cpanel account hosting the WHMCS Installation
    accountName: process.env.whmcsaccountName,

    // Login URL of the WHMCS installation 
    loginUrl: process.env.whmcsloginUrl,

}

module.exports = config;