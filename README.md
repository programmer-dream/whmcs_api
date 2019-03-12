# AD-saml
Active Directory SAML - WHMCS authentication &amp; setup

# Setup SSL for the application

SSL setup instructions here...

# Setting up the Service Provider (SP) to use the ADFS IDP

Passport.js is used to allow for ADFS functionality ...

# Setting up the application 

## Database

Download the latest version of the database: 

`https://educationhost.co.uk/williams_app.sql`

## variables for a new client



# WHMCS Setup

- Setup autoauth funtionality by adding '$autoauthkey = "abcXYZ123";' to the configuration.php file. The value just needs to be a random sequence of letters and numbers.\
- Add payment gateway (Bank transfer) and call it Bank, this is referred to in the code as 'banktransfer'\
- Make sure the Client Signup Email in WHMCS is altered to reflect the actual login URL\
- Modify the 'WHMCS New Order Notification' email template\
- Add server to WHMCS solution\
- Assign the product to the server and package

# Server setup

- Make sure the location hosting the app and the server are the same time (for the autoauth)\
- Setup a reseller user in WHM\
- Add API Token to the reseller account - Make sure the api access allows access to packages\
- Setup a package in WHM - make sure a module is assigned (cpanel and package)

# Third party JS applications used in the project

- WHMCS JS - https://github.com/DamageESP/whmcs-js
- Passport JS - http://www.passportjs.org/
- MySQL - https://www.npmjs.com/package/mysql 