const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_idpdetailBal=require("../../../Bal/user_idpdetails");
const user_idpdetailDal=require("../../../Dal/user_idpdetails");
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
var axios = require("axios");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

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
router.get("/varifyuser",async function (req,res) {
    let connection = mysql.createConnection(whmcsmysqlConfig);
    var email=req.user.upn;
    let clientQuery = "SELECT id FROM tblclients WHERE email='"+email+"'"
    let clientData  = await getWhmcsData(connection, clientQuery)
    let client_id   = ''

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
            user_idpdetailBal.updateUser_IdpDetail({email:email,sessionid:sessionid},async function (data,err) {
                if(data.message=="success"){
                    if (result.data[0].isStaff == 1 && result.data[0].isActive == 1) {
                        // res.redirect("/stafflogin");
                        res.redirect("/staff/login");
                    } else if (result.data[0].isActive == 1) {
                        if(clientData.length){
                            client_id = clientData[0].id
                            let whmcsParams = { action:"CreateSsoToken", 
                                                username:process.env.whmcsidentifier, 
                                                password:process.env.whmcssecret, 
                                                client_id:client_id,
                                                responsetype:"json"
                                            }
                            let response = await axios.post('https://whmcs.educationhost.co.uk/includes/api.php', whmcsParams,{
                                        headers: {
                                          'Content-Type': 'application/x-www-form-urlencoded',
                                          'Access-Control-Allow-Origin': '*',
                                          'Access-Control-Allow-Credentials':'true',
                                          'Access-Control-Allow-Headers':'content-type'
                                        }});

                            res.redirect(response.data.redirect_url);

                        }else {
                            req.flash('error_msg', 'Your account is currently suspended. If you believe this is in error then please contact with Admin!')
                            res.redirect("/");
                        }
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

router.get("/getModuleYearLocation", async (req, res) => {
    let yearQuery = "SELECT DISTINCT YEAR(user_module_start_date) AS year FROM modules_users_assigned"
    let locationQuery="SELECT DISTINCT name FROM teaching_location_details WHERE is_active=1"
    let moduleCodeQuery="SELECT DISTINCT module_code FROM module_details"
    
    let year = await user_idpdetailDal.runRawQuery(yearQuery)
    let location = await user_idpdetailDal.runRawQuery(locationQuery)
    let moduleCode = await user_idpdetailDal.runRawQuery(moduleCodeQuery)
    
    res.send({year,location, moduleCode})
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
router.get("/staffdashboardlistusers", async (req, res) => {
	const sessionid = req.session.id;
	const whmcsconnection = mysql.createConnection(whmcsmysqlConfig);

	// whmcsconnection.connect(function (err) {
	// 	if (err) throw err;

	// 	whmcsconnection.query(
	// 		"SELECT tblclients.id, CONCAT( tblclients.firstname, ' ', tblclients.lastname ) AS fullname, tblclients.email, tblhosting.id, tblhosting.userid, tblhosting.domain, tblhosting.username, tblcustomfields.fieldname, tblcustomfieldsvalues.value, CONCAT( tblhosting.domain, '/', tblcustomfieldsvalues.value ) AS domainmodule, YEAR(tblcustomfieldsvalues.created_at) AS ModuleStartDate FROM tblclients LEFT JOIN tblhosting ON tblclients.id = tblhosting.userid LEFT JOIN tblcustomfieldsvalues ON tblhosting.userid = tblcustomfieldsvalues.relid LEFT JOIN tblcustomfields ON tblcustomfieldsvalues.fieldid = tblcustomfields.id WHERE tblcustomfieldsvalues.value != '' AND tblcustomfields.type = 'client' AND tblclients.status = 'Active'",
	// 		[sessionid],
	// 		(err, result, fields) => {
	// 			if (err) throw err;
	// 			res.send(result);
	// 		}
	// 	);

	// 	whmcsconnection.end();
	// });
    let query = "SELECT ud.id AS ID, CONCAT( ud.firstname, ' ', ud.lastname ) AS fullname, md.module_code, md.module_name, YEAR(mua.user_module_start_date) as mdate, tld.name as location_name, ud.userid AS user_ID, ud.email AS email, CONCAT( ud.userid, '.',cd.domainname ,'/', md.module_code) AS domain_name,CONCAT( ud.userid, '.',cd.domainname) AS domain, CASE WHEN ud.isStaff = 1 THEN 'Yes' ELSE 'No' END AS Is_Staff, CASE WHEN ud.is_admin = 1 THEN 'Yes' ELSE 'No' END AS Is_Admin FROM user_idpdetails ud LEFT JOIN client_details cd ON cd.universityid = ud.universityid LEFT JOIN modules_users_assigned mua on mua.user_id =ud.ID LEFT JOIN module_details md ON md.module_id = mua.module_id LEFT JOIN teaching_location_details tld ON tld.teaching_location_id= ud.user_location_id WHERE ud.isActive = 1 AND tld.is_active != 0"
    let result = await user_idpdetailDal.runRawQuery(query);
    let modifedResult = []
    await Promise.all(
        result.map( async function(rowData){
        let queryStr =  "SELECT username FROM tblhosting WHERE domain = '"+rowData.domain+"'"
        let row = await SelectAllElements(whmcsconnection, queryStr);
        
            rowData.username = ''
            if(row.length)
                rowData.username = row[0].username
            modifedResult.push(rowData)

        })
    )
    res.send(modifedResult);
});

let SelectAllElements = (whmcsconnection, queryStr) =>{
    return new Promise((resolve, reject)=>{
        whmcsconnection.query(queryStr,  (error, elements)=>{
            if(error){
                return reject(error);
            }
            return resolve(elements);
        });
    });
};

router.get("/listusers", async (req, res) => {
    let query = "SELECT ud.id AS ID, CONCAT( ud.firstname, ' ', ud.lastname ) AS fullname, ud.userid AS user_ID, ud.email AS email, CONCAT( ud.userid, '.',cd.domainname ) AS domain_name, CASE WHEN ud.isStaff = 1 THEN 'Yes' ELSE 'No' END AS Is_Staff, CASE WHEN ud.is_admin = 1 THEN 'Yes' ELSE 'No' END AS Is_Admin FROM user_idpdetails ud LEFT JOIN client_details cd ON cd.universityid = ud.universityid WHERE ud.isActive = 1"
    let result = await user_idpdetailDal.runRawQuery(query);
    res.send(result);
});
router.get("/getModuleWithLocation/:id", async (req, res) => {
    let query = "SELECT module_details.* FROM module_details join module_location on module_details.module_id = module_location.module_id WHERE teaching_location_id ="+req.params.id
    let result = await user_idpdetailDal.runRawQuery(query);
    res.send(result);
});

router.get("/getCourseWithLocation/:id", async (req, res) => {
    let query = "SELECT * FROM course_details JOIN course_location ON course_details.id= course_location.course_id WHERE teaching_location_id ="+req.params.id
    let result = await user_idpdetailDal.runRawQuery(query);
    res.send(result);
});

router.get("/getModuleWithCourse/:id", async (req, res) => {
    let query = "SELECT module_details.* FROM module_details JOIN courses_modules_assigned on courses_modules_assigned.module_id = module_details.module_id WHERE  courses_modules_assigned.course_id="+req.params.id
    let result = await user_idpdetailDal.runRawQuery(query);
    res.send(result);
});

router.get("/usersManager", async (req, res) => {
    let query = "SELECT ud.id AS ID, CONCAT( ud.firstname, ' ', ud.lastname ) AS fullname, ud.userid AS user_ID, ud.email AS email, CONCAT( ud.userid, '.',cd.domainname ) AS domain_name, CASE WHEN ud.isStaff = 1 THEN 'Yes' ELSE 'No' END AS Is_Staff, CASE WHEN ud.is_admin = 1 THEN 'Yes' ELSE 'No' END AS Is_Admin FROM user_idpdetails ud LEFT JOIN client_details cd ON cd.universityid = ud.universityid WHERE ud.isActive = 1"
    let result = await user_idpdetailDal.runRawQuery(query);
    res.send(result);
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

router.post("/removeUser/:id",function (req,res) {
    
    user_idpdetailDal.inActiveUser(req.params.id,function (data,err) {
        if(data.message=="success"){
            let user = data.data.toJSON()

            const whmcsClient = new Clients(whmcsConfig);
            const servicClient = new Services(whmcsConfig);

            whmcsClient.getClientsDetails({email:user.email}).then(function (clientResponse) {
                console.log(clientResponse, "<<< clientResponse")
                if(clientResponse.result == 'success'){

                     whmcsClient.getClientsProducts({clientid:clientResponse.userid}).then(async function (productsResponse) {
                        await Promise.all(
                            productsResponse.products.product.map( async function(service){
                                console.log(service.orderid,"<<<< service")
                                await servicClient.moduleTerminate({serviceid:service.orderid}).then(function (terminateResponse) {
                                    console.log(terminateResponse, "<<< terminateResponse")
                                })
                            })
                        )
                        
                        user_idpdetailDal.dropUser(req.params.id)

                        let whmcsParams = { action:"DeleteClient", 
                                        username:process.env.whmcsidentifier, 
                                        password:process.env.whmcssecret, 
                                        clientid:clientResponse.userid,
                                        responsetype:"json",
                                        deleteusers:true,
                                        deletetransactions:true
                                    }
                    
                        let response = await axios.post('https://whmcs.educationhost.co.uk/includes/api.php', whmcsParams,{
                                headers: {
                                  'Content-Type': 'application/x-www-form-urlencoded',
                                  'Access-Control-Allow-Origin': '*',
                                  'Access-Control-Allow-Credentials':'true',
                                  'Access-Control-Allow-Headers':'content-type'
                                }});
                        console.log(response.data, "<<< axios api")
                        
                    })
                }
            })
            
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

let getWhmcsData = (whmcsconnection, queryStr) =>{
    return new Promise((resolve, reject)=>{
        whmcsconnection.query(queryStr,  (error, elements)=>{
            if(error){
                return reject(error);
            }
            return resolve(elements);
        });
    });
};

module.exports = router;
