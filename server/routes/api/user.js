const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_idpdetailBal=require("../../../Bal/user_idpdetails");
const Saml2js = require("saml2js");
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const whmcsmysqlConfig = require("../../config/whmcsinstallationsql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;

// Utility functions
const getTimestamp = require("../../utils/getTimestamp");

// @route 	POST api/user/login/callback
// @desc 	Callback for the saml login
// @access 	Private
router.post('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    function(req, res) {
	var email=req.user._json.email;
        var upn1=email.split("@");
        userid=upn1[0];
        const sessionid = req.session.id;
	var para={
        email:req.user._json.email,
        firstname:req.user.name.givenName,
        lastname:req.user.name.familyName,
        userid:upn1[0],
        sessionid:sessionid
	}


        // Decide where the user is going to go, are they new or existing?
		user_idpdetailBal.getUserIdpDetailByEmail(email,function (result,err) {
            //if no result is passed back then the user data should be stored
            if (!result.data.length) {
                //new user logic
                /////////////// Store the variables in the db for later use
				user_idpdetailBal.addUser_IdpDetail(para,function (data,err1) {
					if(data.message=="success"){
						res.redirect("/home");
					}else{
                        res.send(data.data);
					}
                })
            } else {
                // update session id in the database on user login - this is used to pass data from this route to the staff login route
                user_idpdetailBal.updateUser_IdpDetail({email:email,sessionid:sessionid},function (data,err) {
					if(data.message=="success"){
                        if (result.data[0].isStaff == 1 && result.data[0].isActive == 1) {
                            // res.redirect("/stafflogin");
                            res.redirect("/staff/login");
                        } else if (result.data[0].isActive == 1) {
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
					}else{
                        res.send(data.data);
					}
                })


            }
        })
    });
// @route 	GET api/user/
// @desc 	Get the user variables
// @access 	Public
router.get("/", (req, res) => {
	user_idpdetailBal.getUserBySessionId(req.sessionID,function (data,err) {
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
    })

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
			"SELECT count(ID) AS count FROM user_idpdetails WHERE isActive = 1 && isStaff = 0",
			[sessionid],
			(err, result, fields) => {
				if (err) throw err;
				res.send(result);
			}
		);

		connection.end();
	});
});

// @route 	GET api/user/staffdashboardgetmodules
// @desc 	Get the modules
// @access 	Public
router.get("/staffdashboardgetmodules", (req, res) => {
	const sessionid = req.session.id;
	const whmcsconnection = mysql.createConnection(whmcsmysqlConfig);

	whmcsconnection.connect(function (err) {
		if (err) throw err;

		whmcsconnection.query(
			"SELECT DISTINCT(tblcustomfieldsvalues.value) FROM tblclients LEFT JOIN tblhosting ON tblclients.id = tblhosting.userid LEFT JOIN tblcustomfieldsvalues ON tblhosting.userid = tblcustomfieldsvalues.relid LEFT JOIN tblcustomfields ON tblcustomfieldsvalues.fieldid = tblcustomfields.id WHERE tblcustomfieldsvalues.value != '' AND tblcustomfields.type = 'client' AND tblclients.status = 'Active'",
			[sessionid],
			(err, result, fields) => {
				if (err) throw err;
				res.send(result);
			}
		);

		whmcsconnection.end();
	});
});

// @route 	GET api/user/staffdashboardgetyears
// @desc 	Get the years
// @access 	Public
router.get("/staffdashboardgetyears", (req, res) => {
	const sessionid = req.session.id;
	const whmcsconnection = mysql.createConnection(whmcsmysqlConfig);

	whmcsconnection.connect(function (err) {
		if (err) throw err;

		whmcsconnection.query(
			"SELECT DISTINCT YEAR(tblcustomfieldsvalues.created_at) AS ModuleStartDate FROM tblclients LEFT JOIN tblhosting ON tblclients.id = tblhosting.userid LEFT JOIN tblcustomfieldsvalues ON tblhosting.userid = tblcustomfieldsvalues.relid LEFT JOIN tblcustomfields ON tblcustomfieldsvalues.fieldid = tblcustomfields.id WHERE tblcustomfieldsvalues.value != '' AND tblcustomfields.type = 'client' AND tblclients.status = 'Active'",
			[sessionid],
			(err, result, fields) => {
				if (err) throw err;
				res.send(result);
			}
		);

		whmcsconnection.end();
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

// @route 	GET api/user/staffdashboardlistusers
// @desc 	Get the user variables
// @access 	Public
router.get("/staffdashboardlistusers", (req, res) => {
	const sessionid = req.session.id;
	const whmcsconnection = mysql.createConnection(whmcsmysqlConfig);

	whmcsconnection.connect(function (err) {
		if (err) throw err;

		whmcsconnection.query(
			"SELECT tblclients.id, CONCAT( tblclients.firstname, ' ', tblclients.lastname ) AS fullname, tblclients.email, tblhosting.id, tblhosting.userid, tblhosting.domain, tblhosting.username, tblcustomfields.fieldname, tblcustomfieldsvalues.value, CONCAT( tblhosting.domain, '/', tblcustomfieldsvalues.value ) AS domainmodule, YEAR(tblcustomfieldsvalues.created_at) AS ModuleStartDate FROM tblclients LEFT JOIN tblhosting ON tblclients.id = tblhosting.userid LEFT JOIN tblcustomfieldsvalues ON tblhosting.userid = tblcustomfieldsvalues.relid LEFT JOIN tblcustomfields ON tblcustomfieldsvalues.fieldid = tblcustomfields.id WHERE tblcustomfieldsvalues.value != '' AND tblcustomfields.type = 'client' AND tblclients.status = 'Active'",
			[sessionid],
			(err, result, fields) => {
				if (err) throw err;
				res.send(result);
			}
		);

		whmcsconnection.end();
	});
});

// @route 	GET api/user/staffdashboardusersupportstats
// @desc 	Get the user variables
// @access 	Public
router.get("/staffdashboardusersupportstats", (req, res) => {
	const sessionid = req.session.id;
	const connection = mysql.createConnection(whmcsmysqlConfig);

	connection.connect(function (err) {
		if (err) throw err;

		connection.query(
			"SELECT AVG(FORMAT(rating,2)) AS Average, COUNT(id) AS NumberOfTickets FROM tblticketfeedback WHERE datetime >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) && rating != 0",
			[sessionid],
			(err, result, fields) => {
				if (err) throw err;
				res.send(result);
			}
		);

		connection.end();
	});
});

// @route 	GET api/user/totalsupporttickets
// @desc 	Get the user variables
// @access 	Public
router.get("/totalsupporttickets", (req, res) => {
	const sessionid = req.session.id;
	const connection = mysql.createConnection(whmcsmysqlConfig);

	connection.connect(function (err) {
		if (err) throw err;

		connection.query(
			"SELECT COUNT(id) AS Tickets FROM tbltickets WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)",
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
