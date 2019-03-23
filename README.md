# Active Directory SAML - WHMCS authentication &amp; setup

# Setup hosting account for the application

- Ensure Cloud linux with node selector is installed
- Increase 'Max cPanel process memory' in Tweak settings to 1024

- Add a user account in cpanel for the application 
- Enable shell access for the cpanel account
- Install git on the cpanel account (a good how-to can be found here - https://www.liquidweb.com/kb/configure-deploy-cloudlinuxs-node-js-selector/)
- Assign the cpanel account an IP address and add this to the dns zone for the domain

# Setup SSL for the application

- Install SSL
- Install SSL through the SSL/TLS Wizard in cpanel, this will email this cert, copy the cert and save it as app.crt
- Go to SSL/TLS page and look for the View Private Key option, this will show the generate private key for the new ssl certificate
- Edit the files in the /sslcert folder
    - app.crt - copy and paste the Certificate: (CRT) from the SSL created into here (this is on the Manage SSL Hosts cPanel page)
    - app.key - copy and paste the Private Key (KEY) from the SSL created into here (this is on the Manage SSL Hosts cPanel page)
    - privkey.pem - copy and paste the Private Key (KEY) from the SSL created into here (this is on the Manage SSL Hosts cPanel page)
    - fullchain.pem - Certificate: (CRT) + Certificate Authority Bundle: (CABUNDLE) - one on top of the other

# Install the application (nodejs selector)

- Using the GIT Maneger feature of cPanel, clone the repo (make the repo public during cloning and then set back to private)
- In the cpanel account go to NodeJS selector and setup the application 
- Click NPM install and enter the following settings, make sure node is on node 11 or later

![Image](https://auth.educationhost.co.uk/NodeJS.PNG)

# Setting up the Service Provider (SP) to use the ADFS IDP

Passport.js is used to allow for ADFS functionality ...

# Setting up the application 

- Make sure the cpaneluserhostedaccount is set to the actual account AND passport JS in the /config/ folder contians the username 

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