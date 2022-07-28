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
//var mailer=require("../../utils/emailsend");
// Utility functions
const getTimestamp = require("../../utils/getTimestamp");
var fs = require('fs');
const azureConfig=require(process.env.configwithin);
// @route 	POST api/user/login/callback
// @desc 	Callback for the saml login
// @access 	Private
router.post('/auth/openid/return',

    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    function(req, res) {
	var email=req.user.upn;
        var upn1=email.split("@");
        var userid = upn1[0].toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');

        const sessionid = req.session.id;
	var para={
        email:req.user.upn,
        firstname:req.user.name.givenName,
        lastname:req.user.name.familyName,
        userid:userid,
        sessionid:sessionid
	}


        // Decide where the user is going to go, are they new or existing?
		user_idpdetailBal.getUserIdpDetailByEmail(email,function (result,err) {
            //if no result is passed back then the user data should be stored
            if (result.data.length==0) {
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
                            req.flash('error_msg', 'Your account is currently suspended. If you believe this is in error then please contact with Admin!')
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
router.get("/varifyuser",function (req,res) {
    var email=req.user.upn;
    var upn1=email.split("@");
    var userid = upn1[0].toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');

    const sessionid = req.session.id;
    var para={
        email:req.user.upn,
        firstname:req.user.name.givenName,
        lastname:req.user.name.familyName,
        userid:userid,
        sessionid:sessionid
    }


    // Decide where the user is going to go, are they new or existing?
    user_idpdetailBal.getUserIdpDetailByEmail(email,function (result,err) {
        //if no result is passed back then the user data should be stored
        if (result.data.length==0) {
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
                        req.flash('error_msg', 'Your account is currently suspended. If you believe this is in error then please contact with Admin!')
                        res.redirect("/");
                    }
                }else{
                    res.send(data.data);
                }
            })


        }
    })
})


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
router.get("/getlogincount",function (req,res) {
	user_idpdetailBal.getUserLoginCount(function (data,err) {
		res.status(200).json(data);
    })
})
router.get("/gettoplogin",function (req,res) {
    user_idpdetailBal.getTopLogins(function (data,err) {
    	if(data.message=="success"){
            res.status(200).json(data);
		}else{
            res.status(401).json(data);
		}

    })
})
router.get("/getalllogin",function (req,res) {
    user_idpdetailBal.getTopLogins(function (data,err) {
        if(data.message=="success"){
            res.status(200).json(data);
        }else{
            res.status(401).json(data);
        }

    })
})
router.get("/getallusers",function (req,res) {
    user_idpdetailBal.getAllUsers(function (data,err) {
        if(data.message=="success"){
            res.status(200).json(data.data);
        }else{
            res.status(401).json(data.data);
        }

    })
})
router.get("/suspend/:id?",function (req,res) {
	var status=1;
	if(req.query.type=="sus"){
        status=0
	}else {
        status=1
	}
    user_idpdetailBal.suspendUser({user:req.params.id,isActive:status},function (data,err) {
        if(data.message=="success"){
            res.status(200).json(data);
        }else{
            res.status(401).json(data);
        }

    })
})
router.get("/block",function (req,res) {
	res.render("block");
})

router.get("/staffapprov",function (req,res) {
user_idpdetailBal.approvStaff({email:req.query.email},function (data,err) {
	if(data.message=="success"){
		var staffemail=data.data.dataValues.email;
		var body="Staff account is now approved";
		//mailer(body,staffemail);
		res.status(200).json(data);

	}
})

})


router.get("/logout",function (req,res) {
    req.logout();
    req.session.destroy(function() {
        res.redirect(azureConfig.destroySessionUrl);
    });
})
module.exports = router;
