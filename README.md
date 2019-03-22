# AD-saml
Active Directory SAML - WHMCS authentication &amp; setup

# Setup hosting account for the application

This is currently done on dgital ocean but needs to be on the same server as the database. Needs testing.

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

- Setup autoauth funtionality by adding '$autoauthkey = "abcXYZ123";' to the configuration.php file. The value just needs to be a random sequence of letters and numbers.
- Add payment gateway (Bank transfer) and call it Bank, this is referred to in the code as 'banktransfer'
- Make sure the Client Signup Email in WHMCS is altered to reflect the actual login URL
- Modify the 'WHMCS New Order Notification' email template
- Add server to WHMCS solution
- Setup the package in WHMCS, one for Students mapped to the student WHM product and one for staff mapped to the staf product (different allocation of space and bandwidth)
- Get the IDs for the products/serices and add this into the routes in the app.js file (usually a low number such as 1 for the student account and 3 for staff account)

- Staff need to have an email validation setup to validate their account 
-- In WHMCS - set the product/service email to Other 'Product/Service Welcome Email'.
-- Edit the Other 'Product/Service Welcome Email' to show the following:


`Subject: Please validate your staff account`
`Dear {$client_name},

TO VALIDATE THIS ACCOUNT YOU NEED TO GO TO THE FOLLOWING URL:

APP ROUTE

Once validated you can log in by navigating to:

APP URL

{$signature}`

- Assign the product to the server and package
- Edit the WHMCS New Order Notification to change the title of the email and the body to remove payment type and whmcs link

# Other WHMCS setup items 

- Edit the email headers and footer to reflect Single Sign On links - Hover over the Setup tab and click General Settings. => Click on the Mail tab.
- Modify 'New Account Information' Email template to remove any payment items and make sure links are correct 

# Server setup

- Make sure the location hosting the app and the server are the same time (for the autoauth)
- Setup a reseller user in WHM
- Add API Token to the reseller account - Make sure the api access allows access to packages
- Setup a package in WHM - make sure a module is assigned (cpanel and package)

# Third party JS applications used in the project

- WHMCS JS - https://github.com/DamageESP/whmcs-js
- Passport JS - http://www.passportjs.org/
- MySQL - https://www.npmjs.com/package/mysql 