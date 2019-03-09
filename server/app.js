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


// middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());
// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({ extended: false }));

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
  res.sendFile("/home/ehapp/apps/AD-saml/client/index.html");
});

app.get("/test", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/test.html");
});

/*--------------------------------------------------------------------------------------------------*/
/* 										WHMCS Routes                                                */
/* 			       	Anything in the WHMCS routes can be called from axios in the html               */
/*--------------------------------------------------------------------------------------------------*/

app.get("/whmcs", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/whmcs.html");
});

app.get("/handlebars", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/handlebars.html");
});

/*--------------------------------------------------------------------------------------------------*/
/* 																					WHMCS API                                               */
/* 			         	Anything in the WHMCS routes can be called from axios in the html                 */
/*--------------------------------------------------------------------------------------------------*/

// Get the clients module from whmcs-js
const { Clients } = require("whmcs-js");
const { Orders } = require("whmcs-js");

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

// Add client

app.get("/addclient", function (req, res) {
  // Set up the module with the config file
  // and store it in this variable - can be called anything you want
  const addClient = new Clients(config);

  // Call the getClients call and store the data in the variable called
  addClient
    .addClient({
      firstname: "Nick",
      lastname: "Andrew",
      email: "nick@testingspiaddclient.com",
      address1: "test",
      address2: "test",
      city: "Worcester",
      state: "",
      postcode: "",
      country: "",
      phonenumber: "",
      skipvalidation: true
    })
    .then(function (data) {
      res.send(data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

/* Route used for testing adding an order */
app.get("/addorder", function (req, res) {

  const addOrder = new Orders(config);

  addOrder
    .addOrder({
      clientid: 28,
      domaintype: 'subdomain',
      paymentmethod: 'banktransfer',
      noemail: true,
      noinvoice: true,
      noinvoiceemail: true,
      nameserver1: 'ns1' + '.' + req.body.domainname,
      nameserver2: 'ns2' + '.' + req.body.domainname,
    })
    .then(function (data) {
      res.send(data);
    })
    .catch(function (error) {
      res.send(error);
    });


});

/*--------------------------------------------------------------------------------------------------*/
/* 							Assets folders that can be called from html                             */
/* 			       	Anything in the assets folder can be referenced in the html                     */
/*--------------------------------------------------------------------------------------------------*/
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

app.post("/login/callback", (req, res, next) => {
  passport.authenticate("saml", { session: false }, (err, user) => {
    req.user = user;
    next();
  });
  var parser = new Saml2js(req.body.SAMLResponse);
  var parsedObject = parser.toObject();

  // Put the tems from the object into js variable
  const email = parsedObject.emailAddress;
  const firstname = parsedObject.firstName;
  const userid = parsedObject.userId;
  const lastname = parsedObject.lastName;

  //	req.session = {};
  req.session.user = { id: userid };
  const sessionid = req.session.id;

  //res.send(email);
  // Decide where the user is going to go, are they new or existing?

  var connection = mysql.createConnection(mysqlconfig);

  connection.query(
    "SELECT email FROM user_idpdetails WHERE email = ?",
    [email],
    function (err, result, field) {
      //if no result is passed back then the user data should be stored
      if (!result.length) {
        //new user logic
        //res.send(result);

        /////////////// Store the variables in the db for later use

        //let connection = mysql.createConnection(mysqlconfig);

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
        //existing user, get the email back from the IDP and auto login to WHMCS

        // Store the variables
        // URL of the WHMCS installation
        var whmcsurl = "http://whmcs.educationhost.co.uk/dologin.php";
        // Auto auth key, this needs to match what is setup in the WHMCS config file (see https://docs.whmcs.com/AutoAuth)
        var autoauthkey = "V2Q3kTv3RCwIxb7eiK97rzu1u98iay9Q";
        // get the timestamp in milliseconds and convert it to seconds for WHMCS url
        var timestamp = Math.floor(Date.now() / 1000);
        // get the email address that is returned from the IDP
        var urlemail = parsedObject.emailAddress;
        // URL to where the user is to go once logged into WHMCS
        var goto = "clientarea.php";
        // add the three variables together that are required for the WHMCS hash
        var hashedstrings = email + timestamp + autoauthkey;
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

        // close the mysql connection
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

// The route used to create the student account within WHMCS
// This takes the data from the signup page and passes it to WHMCS using the WHCMSJS module

app.post('/newstudentroute', (req, res) => {
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
    .then(function (response) {
      console.log(response);

      const addOrder = new Orders(config);
      var useridrmspchar = data.userid.toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');

      addOrder
        .addOrder({
          clientid: response.clientid,
          pid: 1,
          domain: useridrmspchar + '.' + req.body.domainname,
          domaintype: subdomain,
          paymentmethod: 'banktransfer',
          noemail: true,
          noinvoice: true,
          noinvoiceemail: true,
          nameserver1: 'ns1' + '.' + req.body.domainname,
          nameserver2: 'ns2' + '.' + req.body.domainname,
        })
        .then(function (data) {
          res.send(data);
        })
        .catch(function (error) {
          res.send(error);
        });



    })
    .catch(function (error) {
      res.send(error);
    });







})

app.get("/home", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/home.html");
});

app.post("/home", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/home.html");
});

app.get("/failedlogin", function (req, res) {
  res.sendFile("/home/ehapp/apps/AD-saml/client/loginFailed");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

/*
var server = http.createServer(app);
*/
const options = {
  cert: fs.readFileSync("/home/ehapp/apps/AD-saml/sslcert/fullchain.pem"),
  key: fs.readFileSync("/home/ehapp/apps/AD-saml/sslcert/privkey.pem")
};

app.listen(8080);
app.use(require("helmet")());
https.createServer(options, app).listen(8443);
