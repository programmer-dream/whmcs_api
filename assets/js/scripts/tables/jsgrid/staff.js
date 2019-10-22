const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;

// Import utility functions
const generateRandomString = require('../../utils/generateRandomString');
const getTimestamp = require('../../utils/getTimestamp');

// Get the modules from whmcs-js
const {
	Clients,
	Orders,
	Services
} = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// Id for the staff product
const staffProductId = 19;

// @route 	POST api/staff/
// @desc 	Creates the staff member
// @access 	Public 
router.post('/', (req, res) => {
	// Set the isStaff value in the database to 1
	const connection = mysql.createConnection(mysqlConfig);
	const StaffEmail = req.body.email;
	const staffnumber = 1;

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

	const addClient = new Clients(whmcsConfig);

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
				{
					result: 'success', 
					clientid: 72 
				}
			*/
			console.log(addClientResponse);

			// Once the user is added in WHMCS, then add the service
			const addOrder = new Orders(whmcsConfig);

			addOrder
				.addOrder({
					clientid: addClientResponse.clientid,
					// This product id relates to the staff service
					pid: staffProductId,
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
						{
							result: 'success',
							orderid: 47,
							productids: '43',
							addonids: '',
							domainids: ''
						}
					*/

					console.log(addOrderResponse);

					// Once the service is added approve the service automatically
					const acceptOrder = new Orders(whmcsConfig);

					acceptOrder.acceptOrder({
						orderid: addOrderResponse.orderid,
						acceptOrder: 1,
						sendemail: 1
					})

						.then(function (acceptOrder) {

							/* RETURNS 
								{
									result: 'success'
								}				
							*/

							console.log(acceptOrder);

							// Usernames can be tricky, and because there could be two people with the same name, we need to create a new service username
							// This will be a random string with the mat.random function
							const updateClientProduct = new Services(whmcsConfig);
							const randomstring = generateRandomString();
							console.log(randomstring);

							updateClientProduct.updateClientProduct({
								serviceid: addOrderResponse.productids,
								serviceusername: randomstring
							})
								.then(function (updateClientProductResponse) {

									/* RETURNS 
                  						sonsfa9
                  						{
											result: 'success',
											serviceid: '34'
										}               
                  					*/

									console.log(updateClientProductResponse);

									// create the accepted order
									const moduleCreate = new Services(whmcsConfig);
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
});

// @route 	POST api/staff/login
// @desc 	Redirect and log the staff member into whmcs
// @access 	Public 
router.post('/login', (req, res) => {
	// get the timestamp for WHMCS url
	var timestamp = getTimestamp();

	// get the email address that is returned from the IDP
	var urlemail = req.body.email;

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
});

module.exports = router;
