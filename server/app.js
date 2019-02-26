/*--------------------------------------------------------------------------------------------------*/
/* 								      Required node modules                                         */
/*--------------------------------------------------------------------------------------------------*/

const passport = require('passport');
const express = require('express');

const app = express();

/*--------------------------------------------------------------------------------------------------*/
/* 								   Links to configuration files                                     */
/*--------------------------------------------------------------------------------------------------*/

require('./config/passport.js');
const config = require('./config/whmcs.js');

app.use(passport.initialize());
app.use(passport.session());
//app.use(whmcs.initialize());

app.get('/', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/index.html');
});

app.get('/test', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/test.html');
});

/*--------------------------------------------------------------------------------------------------*/
/* 										WHMCS Routes                                                */
/* 			       	Anything in the WHMCS routes can be called from axios in the html               */
/*--------------------------------------------------------------------------------------------------*/


app.get('/whmcs', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/whmcs.html');
});

app.get('/handlebars', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/handlebars.html');
});

/*--------------------------------------------------------------------------------------------------*/
/* 																					WHMCS API                                               */
/* 			         	Anything in the WHMCS routes can be called from axios in the html                 */
/*--------------------------------------------------------------------------------------------------*/


// Get the clients module from whmcs-js
const { Clients } = require('whmcs-js');
	
app.get('/listallwhmcsusers', function(req, res) {
	// Set up the module with the config file
	// and store it in this variable - can be called anything you want
	const myClients = new Clients(config);
	
	// Call the getClients call and store the data in the variable called invoices
	myClients.getClients()
		.then(function(data) {
			res.send(data);		
		})
		.catch(function(error) {
			res.send(error)
		});
});

// Add client

app.get('/addclient', function(req, res) {
	// Set up the module with the config file
	// and store it in this variable - can be called anything you want
	const addClient = new Clients(config);
	
	// Call the getClients call and store the data in the variable called invoices
	addClient.addClient(
		firstname = "Nick",
		lastname = "Andrew",
		email = "nick@testingspiaddclient.com",
		address1	= "test",
		address2 = "test",
		city = "Worcester",
		state = "",
		postcode = "",
		country = "",
		phonenumber = "",
		skipvalidation = true
	)
		.then(function(data) {
			res.send(data);		
		})
		.catch(function(error) {
			res.send(error)
		});
});


/*--------------------------------------------------------------------------------------------------*/
/* 							Assets folders that can be called from html                             */
/* 			       	Anything in the assets folder can be referenced in the html                     */
/*--------------------------------------------------------------------------------------------------*/
app.use(express.static('assets'));

app.get('/login',
	passport.authenticate('saml', { failureRedirect: '/home/ehapp/apps/AD-saml/client/loginFailed', failureFlash: true }),
    function(req, res) {
		res.redirect('/home');
	}
);
  
app.post('/adfs/postResponse',
	passport.authenticate('saml', { failureRedirect: '/home/ehapp/apps/AD-saml/client/loginFailed', failureFlash: true }),
    function(req, res) {
		res.redirect('/home');
	}
);

/*
app.get('/secure', validUser, routes.secure),

function validUser(req, res, next) {
	if (!req.user) {
		res.redirect('/login');
	}
    next();
}
*/
app.get('/home', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/home.html');
});
/*
var server = http.createServer(app);
*/
var server = app.listen(8080, function(){
});