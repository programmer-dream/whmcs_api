// shipitfile.js
module.exports = shipit => {
    // Load shipit-deploy tasks
    require('shipit-deploy')(shipit)
  
    shipit.initConfig({
      default: {
        deployTo: '/home/deploy/adsaml',
        repositoryUrl: 'https://github.com/nickwilliams999/AD-saml.git',
      },
      staging: {
        servers: 'deploy@46.101.47.173',
      },
    })
  }