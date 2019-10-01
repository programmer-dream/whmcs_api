const express = require("express");
const router = express.Router();
const passport = require("passport");
const Saml2js = require("saml2js");
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;

// Utility functions
const getTimestamp = require("../../utils/getTimestamp");

// @route 	POST api/user/login/callback
// @desc 	Callback for the saml login
// @access 	Private
router.post("/login/callback", (req, res, next) => {
  passport.authenticate(
    "saml",
    {
      session: false
    },
    (err, user) => {
      req.user = user;
      next();
    }
  );

  var parser = new Saml2js(req.body.SAMLResponse);

  const {
    emailAddress: email,
    firstName: firstname,
    userId: userid,
    lastName: lastname
  } = parser.toObject();

  // Check if the received data is valid
  if (!email || !firstname || !userid || !lastname) {
    res.redirect("/home");
    return;
  }

  req.session.user = {
    id: userid
  };

  const sessionid = req.session.id;

  // Decide where the user is going to go, are they new or existing?
  const connection = mysql.createConnection(mysqlConfig);

  connection.query(
    "SELECT email, isStaff FROM user_idpdetails WHERE email = ?",
    [email],
    (err, result, field) => {
      //if no result is passed back then the user data should be stored
      if (!result.length) {
        //new user logic
        /////////////// Store the variables in the db for later use
        let stmt = `INSERT INTO user_idpdetails(email,firstname,userid,lastname,sessionid) VALUES(?,?,?,?,?)`;
        let todo = [email, firstname, userid, lastname, sessionid];

        // execute the insert statment
        connection.query(stmt, todo, (err, results, fields) => {
          if (err) {
            return res.send(err.message);
          } else {
            // Redirect the user to the home page if the INSERT failed (signup page)
            res.redirect("/home");
          }
        });

        // close the mysql connection
        connection.end();
      } else {
        // update session id in the database on user login - this is used to pass data from this route to the staff login route
        connection.query(
          "UPDATE user_idpdetails SET sessionid = ? WHERE email = ?",
          [sessionid, email],
          (error, results, fields) => {
            if (error) {
              console.log("error", error);
            }
          }
        );

        connection.query(
          "SELECT * FROM user_idpdetails WHERE email = ?",
          [email],
          (err, result, field) => {
            if (result[0].isStaff == 1 && result[0].isActive == 1) {
              // res.redirect("/stafflogin");
              res.redirect("/api/staff/login");
            } else if (result[0].isActive == 1) {
              // get the timestamp in milliseconds and convert it to seconds for WHMCS url
              var timestamp = getTimestamp();

              // get the email address that is returned from the IDP
              var urlemail = email;

              // URL to where the user is to go once logged into WHMCS
              var goto = "clientarea.php";

              // Auto auth key, this needs to match what is setup in the WHMCS config file (see https://docs.whmcs.com/AutoAuth)
              // add the three variables together that are required for the WHMCS hash
              var hashedstrings = urlemail + timestamp + autoAuthKey;

              // use the sha1 node module to hash the variable
              var hash = sha1(hashedstrings);

              // create the URL to pass and redirect the user
              res.redirect(
                whmcsLoginUrl +
                "?email=" +
                urlemail +
                "&timestamp=" +
                timestamp +
                "&hash=" +
                hash +
                "&goto=" +
                goto
              );
            } else {
              res.redirect("/");
            }
          }
        );

        connection.end();
      }
    }
  );
});

// @route 	GET api/user/
// @desc 	Get the user variables
// @access 	Public
router.get("/", (req, res) => {
  const sessionid = req.session.id;
  const connection = mysql.createConnection(mysqlConfig);

  connection.connect(function (err) {
    if (err) throw err;

    connection.query(
      "SELECT * FROM user_idpdetails uidp LEFT JOIN client_details cd ON uidp.universityid = cd.universityid LEFT JOIN client_availablemodules cam ON cd.universityid = cam.universityid WHERE sessionid = ?",
      [sessionid],
      (err, result, fields) => {
        if (err) throw err;
        res.send(result);
      }
    );

    connection.end();
  });
});

// @route 	GET api/user/staffdashboardusercount
// @desc 	Get the user variables
// @access 	Public
router.get("/staffdashboardusercount", (req, res) => {
  const sessionid = req.session.id;
  const connection = mysql.createConnection(mysqlConfig);

  connection.connect(function (err) {
    if (err) throw err;

    connection.query(
      "SELECT count(ID) AS count FROM user_idpdetails WHERE isActive = 1",
      [sessionid],
      (err, result, fields) => {
        if (err) throw err;
        res.send(result);
      }
    );

    connection.end();
  });
});

// @route 	GET api/user/staffdashboardusercount
// @desc 	Get the user variables
// @access 	Public
router.get("/staffdashboardstaffcount", (req, res) => {
  const sessionid = req.session.id;
  const connection = mysql.createConnection(mysqlConfig);

  connection.connect(function (err) {
    if (err) throw err;

    connection.query(
      "SELECT count(ID) AS count FROM user_idpdetails WHERE isStaff = 1 && isActive = 1",
      [sessionid],
      (err, result, fields) => {
        if (err) throw err;
        res.send(result);
      }
    );

    connection.end();
  });
});
module.exports = router;