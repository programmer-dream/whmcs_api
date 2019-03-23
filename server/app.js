/*--------------------------------------------------------------------------------------------------*/
/* 								      Required node modules                                         */
/*--------------------------------------------------------------------------------------------------*/

const passport = require("passport");
const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const Saml2js = require("saml2js");
const jQuery = require("jquery");
var mysql = require("mysql");
var sha1 = require("sha1");
const handlebars = require("express-handlebars");
var cors = require('cors');
var cpanel = require('cpanel-lib');

const cpaneluserhostedaccount = 'xhgkhpdb';


const cpoptions = require("./config/cpanel.js");
/*

app.use('/accounts', function (req, res) {


  //var cpanelClient = cpanel.Fileman(options);
  var cpanelClient = cpanel.createClient({});

  cpanelClient.call('listaccts', { 'api.version': 1, search: 'ud' }, function (error, data) {
    console.log('listaccts');

    if (error) {
      return res.send({
        ok: false,
        error: error
      });
    }

    return res.send({
      ok: true,
      data: data
    })

  });

});
*/

app.use(cors());

// middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());
// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({
  extended: false
}));


global.autoauth = 'V2Q3kTv3RCwIxb7eiK97rzu1u98iay9Q';
global.whmcsURL = 'http://whmcs.educationhost.co.uk/dologin.php';

/*--------------------------------------------------------------------------------------------------*/
/* 								   Links to configuration files                                     */
/*--------------------------------------------------------------------------------------------------*/

require("./config/passport.js");
const config = require("./config/whmcs.js");
let mysqlconfig = require("./config/sql.js");

app.use(passport.initialize());
app.use(passport.session());

// to handle the session
var session = require("express-session");

//app.use(whmcs.initialize());

app.get("/", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/index.html");
});

app.get("/test", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/test.html");
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// WHMCS Routes /////////////////////////////////////////
/////////////////Anything in the WHMCS routes can be called from axios in the html//////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


app.get("/whmcs", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/whmcs.html");
});

app.get("/handlebars", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/handlebars.html");
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// WHMCS API /////////////////////////////////////////
/////////////////Anything in the WHMCS routes can be called from axios in the html//////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

// Get the clients module from whmcs-js
const {
  Clients
} = require("whmcs-js");

// Get the Orders module from whmcs-js
const {
  Orders
} = require("whmcs-js");

// Get the Services module from whmcs-js
const {
  Services
} = require("whmcs-js");


////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// WHMCS API TESTING ROUTES //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/* Route used for testing adding an order
app.get("/addorder", function (req, res) {

  const addOrder = new Orders(config);

  addOrder
    .addOrder({
      clientid: 25,
      pid: 1,
      domain: 'dddnick.com',
      paymentmethod: 'banktransfer',
      noemail: true,
      noinvoice: true,
      noinvoiceemail: true
    })
    .then(function (data) {
      res.send(data);
    })
    .catch(function (error) {
      res.send(error);
    });


}); 

app.get("/listallwhmcsusers", function (req, res) {
  // Set up the module with the config file
  // and store it in this variable - can be called anything you want
  const myClients = new Clients(config);

  // Call the getClients call and store the data in the variable called invoices
  myClients
    .getClients()
    .then(function (data) {
      res.send(data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
*/



////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////Assets folders that can be called from html//////////////////////
//////////////////Anything in the assets folder can be referenced in the html///////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


app.use(express.static("assets"));

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "EHsecret",
    expires: new Date(Date.now() + 30 * 86400 * 1000)
  })
);

app.get(
  "/login",
  passport.authenticate("saml", {
    successRedirect: "/home",
    failureRedirect: "/failedlogin"
  })
);


////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// MAIN LOGIN ROUTE /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

app.post("/login/callback", (req, res, next) => {
  passport.authenticate("saml", {
    session: false
  }, (err, user) => {
    req.user = user;
    next();
  });
  var parser = new Saml2js(req.body.SAMLResponse);
  var parsedObject = parser.toObject();

  // Put the items from the object into js variable
  const email = parsedObject.emailAddress;
  const firstname = parsedObject.firstName;
  const userid = parsedObject.userId;
  const lastname = parsedObject.lastName;

  //	req.session = {};
  req.session.user = {
    id: userid
  };
  const sessionid = req.session.id;

  //res.send(email);
  // Decide where the user is going to go, are they new or existing?

  var connection = mysql.createConnection(mysqlconfig);

  connection.query(
    "SELECT email, isStaff FROM user_idpdetails WHERE email = ?",
    [email],
    function (err, result, field) {
      //if no result is passed back then the user data should be stored
      if (!result.length) {
        //new user logic
        //console.log(result);

        /////////////// Store the variables in the db for later use

        let stmt = `INSERT INTO user_idpdetails(email,firstname,userid,lastname,sessionid)
																									VALUES(?,?,?,?,?)`;
        let todo = [email, firstname, userid, lastname, sessionid];

        // execute the insert statment
        connection.query(stmt, todo, (err, results, fields) => {

          if (err) {
            return res.send(err.message);
          }
        });

        // Redirect the user to the home page (signup page)
        res.redirect("/home");
        // close the mysql connection
        connection.end();


      } else {

        // update session id in the database on user login - this is used to pass data from this route to the staff login route

        connection.query('UPDATE user_idpdetails SET sessionid = ? WHERE email = ?', [sessionid, email], function (error, results, fields) {
          if (error) {
            console.log("error", error);
          }
        });


        connection.query(
          "SELECT * FROM user_idpdetails WHERE email = ?",
          [email],
          function (err, result, field) {
            //console.log(result);
            //var data = result.data[0];
            //console.log(result[0].email);
            //console.log(result[0].isStaff);
            if (result[0].isStaff == 1 && result[0].isActive == 1) {

              res.redirect('/stafflogin')

            } else if (result[0].isActive == 1) {

              var whmcsurl = global.whmcsURL;
              // Auto auth key, this needs to match what is setup in the WHMCS config file (see https://docs.whmcs.com/AutoAuth)
              var autoauthkey = global.autoauth;
              // get the timestamp in milliseconds and convert it to seconds for WHMCS url
              var timestamp = Math.floor(Date.now() / 1000);
              // get the email address that is returned from the IDP
              var urlemail = parsedObject.emailAddress;
              // URL to where the user is to go once logged into WHMCS
              var goto = "clientarea.php";
              // add the three variables together that are required for the WHMCS hash
              var hashedstrings = urlemail + timestamp + autoauthkey;
              // use the sha1 node module to hash the variable
              var hash = sha1(hashedstrings);
              // create the URL to pass and redirect the user
              res.redirect(
                whmcsurl +
                "?email=" +
                urlemail +
                "&timestamp=" +
                timestamp +
                "&hash=" +
                hash +
                "&goto=" +
                goto
              );

            } else { res.redirect('/'); }


          });


        connection.end();
      }




    }
  );

  req, res, next;
});

app.get("/newusersvariables", function (req, res) {
  const sessionid = req.session.id;
  //	res.send(sessionid);

  //let newuser = mysql.createConnection(mysqlconfig);
  let connection = mysql.createConnection(mysqlconfig);

  connection.connect(function (err) {
    if (err) throw err;
    connection.query(
      "SELECT * FROM user_idpdetails uidp LEFT JOIN client_details cd ON uidp.universityid = cd.universityid LEFT JOIN client_availablemodules cam ON cd.universityid = cam.universityid WHERE sessionid = ?",
      [sessionid],
      function (err, result, fields) {
        if (err) throw err;

        //res.send(result);
        var userdetails = result;
        res.send(userdetails);
      }
    );

    connection.end();
  });
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// API FOR EXPIRED ACCOUNTS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////



// API that accepts URL paramaters to update record into mysql database
app.get('/api/expiredaccounts/', function (req, res) {

  var UserEmail = req.query.email;
  var APIkey = req.query.apikey;
  var EXPdate = req.query.expdate;
  var isactiveflag = 0;

  // Set the isStaff value in the database to 1
  var connection = mysql.createConnection(mysqlconfig);

  // Check to see that all of the passed variables have values, if anything is null then this will error.
  if (UserEmail != null && APIkey != null && EXPdate != null) {
    connection.connect(function (err) {
      if (err) throw err;
      connection.query('UPDATE user_idpdetails LEFT JOIN client_details ON user_idpdetails.universityid = client_details.universityid SET isActive = ?, expiryDate = ? WHERE email = ? AND APIkey = ?', [isactiveflag, EXPdate, UserEmail, APIkey], function (error, results, fields) {
        if (error) {
          console.log("error", error);
        } else {
          if (results.affectedRows >= 1) {
            console.log(results.affectedRows);

            // Get the clients details from WHMCS

            const clientexproutegetclientdetails = new Clients(config);

            clientexproutegetclientdetails.getClientsDetails({

              /* This returns { userid: 86,
               id: 86,
               uuid: 'cb0512f5-3dd2-4e31-869a-853efc3e8bd1',
               firstname: 'Firstname',
               lastname: 'Lastname',
               fullname: 'firstname + lastname',
               companyname: 'Education Host ltd',
               email: 'a@email.com',
               address1: '',
               address2: '',
              .. and loads more data ...
           */

              email: UserEmail
            }
            )
              .then(function (clientexproutegetclientdetailsResponse) {

                //console.log(clientexproutegetclientdetailsResponse);
                const clientexproutecloseclientaccount = new Clients(config);
                // close the clients account (which terminates associated services related to it).
                clientexproutecloseclientaccount.closeClient({

                  clientid: clientexproutegetclientdetailsResponse.userid

                })

                  .then(function (clientexproutecloseclientaccountResponse) {
                    console.log(clientexproutecloseclientaccountResponse.respose);
                  })
                  .catch(function (error) {
                    res.send(error);
                  });


              })
              .catch(function (error) {
                res.send(error);
              });

            res.send('User account set to inactive and removed from our systems!')



          } else {
            res.send('User cannot be found, or the API key is not valid.');

          }
        }
      });
      connection.end();
    });


    // End of the if statement to check for null values
  } else {
    res.send('Error - All parameters need to be passed to the api through the URL for the API to work');
  }

});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////// The route used to create the student account within WHMCS ///////////////////
// This takes the data from the signup page and passes it to WHMCS using the WHCMSJS module/
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

//STUDENT ROUTE 
app.post('/newstudentroute', (req, res) => {

  // Gets the student modules back from the student function
  // This will be used to create the module folders

  var StudentModules = req.body.selected;
  if (StudentModules != null) {
    console.log(StudentModules)
  }


  // Set up the module with the config file
  // and store it in this variable - can be called anything you want
  const addClient = new Clients(config);

  // Call the getClients call and store the data in the variable called 
  addClient
    .addClient({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address1: req.body.Address1,
      address2: req.body.Address2,
      city: req.body.City,
      state: req.body.State,
      postcode: req.body.Postcode,
      country: req.body.Country,
      phonenumber: req.body.Phone,
      notes: 'Created through Education Host AD login',
      language: 'english',
      skipvalidation: true
    })
    .then(function (addClientResponse) {

      /* RETURNS 
      { result: 'success', 
      clientid: 72 } */


      console.log(addClientResponse);
      // Once the user is added in WHMCS, then add the service
      const addOrder = new Orders(config);

      addOrder
        .addOrder({
          clientid: addClientResponse.clientid,
          // This product id relates to the student service
          pid: 1,
          domain: req.body.fulldomain,
          nameserver1: req.body.nameserver1,
          nameserver2: req.body.nameserver2,
          paymentmethod: 'banktransfer',
          noemail: true,
          noinvoice: true,
          noinvoiceemail: true
        })
        .then(function (addOrderResponse) {


          /* RETURNS 
          { result: 'success',
          orderid: 47,
          productids: '43',
          addonids: '',
          domainids: '' } */

          console.log(addOrderResponse);


          // Once the service is added approve the service automatically
          const acceptOrder = new Orders(config);

          acceptOrder.acceptOrder({
            orderid: addOrderResponse.orderid,
            acceptOrder: 1,
            sendemail: 0
          })

            .then(function (acceptOrder) {

              /* 
              RETURNS 
              { result: 'success' }
              
              */

              console.log(acceptOrder);

              // Usernames can be tricky, and because there could be two people with the same name, we need to create a new service username
              // This will be a random string with the mat.random function
              const updateClientProduct = new Services(config);
              const randomstring = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).substring(1, 8).toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');
              console.log(randomstring);

              updateClientProduct.updateClientProduct({
                serviceid: addOrderResponse.productids,
                serviceusername: randomstring
              })
                .then(function (updateClientProductResponse) {



                  /* 
                  RETURNS 
                  sonsfa9
                  { result: 'success', serviceid: '34' }
    
              
                  */

                  console.log(updateClientProductResponse);

                  // create the accepted order
                  const moduleCreate = new Services(config);
                  moduleCreate
                    .moduleCreate({

                      serviceid: updateClientProductResponse.serviceid

                    })
                    .then(function (moduleCreateResponse) {

                      ////////////////////////////////////////////////////////
                      // There needs to be a password change here to a random charater password
                      // This is to authenticate the user so that folders can be created
                      ////////////////////////////////////////////////////////


                      // udate client password so that we can connect to the cpanel API
                      const updateClientPassword = new Services(config);
                      const newuserpassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

                      updateClientPassword.moduleChangePw({
                        serviceid: updateClientProductResponse.serviceid,
                        servicepassword: newuserpassword
                      })
                        .then(function (updateClientPasswordResponse) {
                          // Set the cPanel variables for connection 

                          ////////////////////////////////////////////////////////
                          // The password below should be the password that has been changed above and passed into the options
                          ////////////////////////////////////////////////////////


                          var cpoptions = {
                            host: '109.73.172.154',
                            port: 2083,
                            secure: true,
                            // The username is driven from the random username created when creating the service
                            username: randomstring,
                            // USE the newly generated password
                            password: newuserpassword,
                            ignoreCertError: true
                          };


                          ////////////////////////////////////////////////////////
                          //Setup the folders/////////////////////////////////////
                          ////////////////////////////////////////////////////////

                          var cpanelClient = cpanel.createClient(cpoptions);
                          var count = 0;

                          do {
                            var smodules = StudentModules[count];
                            cpanelClient.callApi2('Fileman', 'mkdir', { path: '/home/' + randomstring + '/public_html/', name: smodules, permissions: '755' }, function (err, res) {
                              console.log('Result: %j', res);
                            });
                            count++;
                          }

                          while (count != StudentModules.length);
                          res.send('SUCCESS');

                        })
                        .catch(function (error) {
                          res.send(error);
                        });

                    })
                    .catch(function (error) {
                      res.send(error);
                    });


                })
                .catch(function (error) {
                  res.send(error);
                });


            })
            .catch(function (error) {
              res.send(error);
            });

        })
        .catch(function (error) {
          res.send(error);
        });

    })
    .catch(function (error) {
      res.send(error);
    });

})
app.post('/newstaffroute', (req, res) => {
  // STAFF ROUTE 

  // Set the isStaff value in the database to 1
  var connection = mysql.createConnection(mysqlconfig);
  const StaffEmail = req.body.email;
  var staffnumber = 1;
  connection.connect(function (err) {
    if (err) throw err;
    connection.query('UPDATE user_idpdetails SET isStaff = ? WHERE email = ?', [staffnumber, StaffEmail], function (error, results, fields) {
      if (error) {
        console.log("error", error);
      }
    });
    connection.end();
  });

  // Set the staff user up on WHMCS - this account will require manual approval
  // The thing that will change here is that there will be a different product ID and it will require approval by admin user

  const addClient = new Clients(config);

  // Call the getClients call and store the data in the variable called 
  addClient
    .addClient({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address1: req.body.Address1,
      address2: req.body.Address2,
      city: req.body.City,
      state: req.body.State,
      postcode: req.body.Postcode,
      country: req.body.Country,
      phonenumber: req.body.Phone,
      notes: 'Staff account - Created through Education Host AD login',
      language: 'english',
      skipvalidation: true
    })
    .then(function (addClientResponse) {

      /* RETURNS 
      { result: 'success', 
      clientid: 72 } */


      console.log(addClientResponse);
      // Once the user is added in WHMCS, then add the service
      const addOrder = new Orders(config);

      addOrder
        .addOrder({
          clientid: addClientResponse.clientid,
          // This product id relates to the student service
          pid: 3,
          domain: req.body.fulldomain,
          nameserver1: req.body.nameserver1,
          nameserver2: req.body.nameserver2,
          paymentmethod: 'banktransfer',
          noemail: true,
          noinvoice: true,
          noinvoiceemail: true
        })
        .then(function (addOrderResponse) {


          /* RETURNS 
          { result: 'success',
          orderid: 47,
          productids: '43',
          addonids: '',
          domainids: '' } */

          console.log(addOrderResponse);


          // Once the service is added approve the service automatically
          const acceptOrder = new Orders(config);

          acceptOrder.acceptOrder({
            orderid: addOrderResponse.orderid,
            acceptOrder: 1,
            sendemail: 1
          })

            .then(function (acceptOrder) {

              /* 
              RETURNS 
              { result: 'success' }
              
              */

              console.log(acceptOrder);

              // Usernames can be tricky, and because there could be two people with the same name, we need to create a new service username
              // This will be a random string with the mat.random function
              const updateClientProduct = new Services(config);
              const randomstring = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).substring(1, 8).toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');
              console.log(randomstring);

              updateClientProduct.updateClientProduct({
                serviceid: addOrderResponse.productids,
                serviceusername: randomstring
              })
                .then(function (updateClientProductResponse) {

                  /* 
                  RETURNS 
                  sonsfa9
                  { result: 'success', serviceid: '34' }
 
              
                  */

                  console.log(updateClientProductResponse);

                  // create the accepted order
                  const moduleCreate = new Services(config);
                  moduleCreate
                    .moduleCreate({

                      serviceid: updateClientProductResponse.serviceid

                    })

                    .then(function (moduleCreateResponse) {
                      res.send('SUCCESS');
                    })
                    .catch(function (error) {
                      res.send(error);
                    });


                })
                .catch(function (error) {
                  res.send(error);
                });


            })
            .catch(function (error) {
              res.send(error);
            });

        })
        .catch(function (error) {
          res.send(error);
        });

    })
    .catch(function (error) {
      res.send(error);
    });

})


////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// Other routes ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

app.get("/home", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/home.html");
});

app.post("/home", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/client/home.html");
});

app.get("/staffdashboard", function (req, res) {
  res.sendFile("/home/ " + cpaneluserhostedaccount + "/apps/AD-saml/staff/dashboard.html");
});

app.post("/staffdashboard", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/staff/dashboard.html");
});

app.get("/stafflogin", function (req, res) {
  res.sendFile("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/staff/index.html");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});



app.post('/stafflogintowhmcs', (req, res) => {
  var whmcsurl = 'https://whmcs.educationhost.co.uk/dologin.php';
  // Auto auth key, this needs to match what is setup in the WHMCS config file (see https://docs.whmcs.com/AutoAuth)
  var autoauthkey = global.autoauth;
  // get the timestamp in milliseconds and convert it to seconds for WHMCS url
  var timestamp = Math.floor(Date.now() / 1000);
  // get the email address that is returned from the IDP
  var urlemail = req.body.email;
  // URL to where the user is to go once logged into WHMCS
  var goto = "clientarea.php";
  // add the three variables together that are required for the WHMCS hash
  var hashedstrings = urlemail + timestamp + autoauthkey;
  // use the sha1 node module to hash the variable
  var hash = sha1(hashedstrings);
  // create the URL to pass and redirect the user
  res.redirect(
    whmcsurl +
    "?email=" +
    urlemail +
    "&timestamp=" +
    timestamp +
    "&hash=" +
    hash +
    "&goto=" +
    goto
  );

});

////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Link to fullchain and private cert /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


const options = {
  cert: fs.readFileSync("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/sslcert/fullchain.pem"),
  key: fs.readFileSync("/home/" + cpaneluserhostedaccount + "/apps/AD-saml/sslcert/privkey.pem")
};


////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Create server and HTTPS connection//////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

app.listen(8080);
app.use(require("helmet")());
https.createServer(options, app).listen(8443);