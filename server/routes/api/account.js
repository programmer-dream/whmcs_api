const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");

// Get the modules from whmcs-js
const {
	Clients
} = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// @route 	POST api/account/
// @desc 	Updates expired accounts
// @access 	Public 
router.get('/', function (req, res) {
	const UserEmail = req.query.email;
	const APIkey = req.query.apikey;
	const EXPdate = req.query.expdate;
	const isactiveflag = 0;

	// Check to see that all of the passed variables have values, if anything is null then this will error.
	if (UserEmail === null || APIkey === null || EXPdate === null) {
		return res.send('Error - All parameters need to be passed to the api through the URL for the API to work');
	}

	// Set the isStaff value in the database to 1
	const connection = mysql.createConnection(mysqlConfig);

	connection.connect(function (err) {
		if (err) throw err;

		connection.query('UPDATE user_idpdetails LEFT JOIN client_details ON user_idpdetails.universityid = client_details.universityid SET isActive = ?, expiryDate = ? WHERE email = ? AND APIkey = ?', [isactiveflag, EXPdate, UserEmail, APIkey], function (error, results, fields) {
			if (error) {
				console.log("error", error);
			} else {
				if (results.affectedRows >= 1) {
					console.log(results.affectedRows);

					// Get the clients details from WHMCS
					const clientexproutegetclientdetails = new Clients(whmcsConfig);
					clientexproutegetclientdetails.getClientsDetails({
						email: UserEmail
					})
						.then(function (clientexproutegetclientdetailsResponse) {

							/* RETURNS
								{
									userid: 86,
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
								}
							*/

							const clientexproutecloseclientaccount = new Clients(whmcsConfig);

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
});

module.exports = router;