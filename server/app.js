/*--------------------------------------------------------------------------------------------------*/
/* 								      Required node modules                                         */
/*--------------------------------------------------------------------------------------------------*/

const passport = require('passport');
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const Saml2js = require('saml2js');


 // middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());
// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({ extended: false }));

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
		{
				firstname:'Nick',
				lastname: 'Andrew',
				email: 'nick@testingspiaddclient.com',
				address1: 'test',
				address2: 'test',
				city: 'Worcester',
				state: '',
				postcode: '',
				country: '',
				phonenumber: '',
				skipvalidation: true 
			}
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

/*
app.get('/login',
	passport.authenticate('saml', { failureRedirect: '/home/ehapp/apps/AD-saml/client/loginFailed', failureFlash: true }),
    function(req, res) {	
		// redirect them to the home screen to signup or be signed in
		res.redirect('/home');
	}
);
  
app.post('/adfs/postResponse',
	passport.authenticate('saml', { failureRedirect: '/home/ehapp/apps/AD-saml/client/loginFailed', failureFlash: true }),
    function(req, res) {

	/* get the email back from the post, loop through all users and see if they exist already 
	 if not then show them the new user modal on the home page 

							// Get the user data out of the saml response
							var parser = new Saml2js(res.body.SAMLResponse);
							var parsedObject = parser.asObject();
							//console.log(parsedObject);
							console.log(parser.asObject());
							var firstName = parser.get('first name');
							console.log(firstName); //=> 'John'
							var firstName = parser.get('email');
							console.log(email); //=> 'John'
							console.log(req.body);
		
		// redirect them to the home screen to signup or be signed in
		res.redirect('/whmcs');
	}
); */



app.get("/login",
    passport.authenticate("saml", {		
		successRedirect: '/home',
		failureRedirect: '/failedlogin'
		
    })
);


app.post("/login/callback",
         (req, res, next) => {
            passport.authenticate("saml", { session: false }, (err, user) => {
				req.user = user;
				next();		

			})
			//res.send(res.body);


			var parser = new Saml2js(req.body.SAMLResponse);
			res.json(parser);
			//var parsedObject = parser.asObject();
			//console.log(parsedObject);
					//res.send(parser.asObject());

			//var firstName = parser.get('emailAddress');
			//res.send(emailAddress); //=> 'John'
			var parsedObject =  parser.asObject()
						var firstName = parser.get('emailAddress');
			res.send(emailAddress); //=> 'John'dddd









			res.redirect('/home');
			(req, res, next);
         },
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

app.post('/home', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/home.html');
	
});


app.get('/failedlogin', function(req, res) {
	res.sendFile('/home/ehapp/apps/AD-saml/client/loginFailed');
});


app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
  });

/*
var server = http.createServer(app);
*/
const options = {
	cert: fs.readFileSync('/home/ehapp/apps/AD-saml/sslcert/fullchain.pem'),
	key: fs.readFileSync('/home/ehapp/apps/AD-saml/sslcert/privkey.pem')
};



app.listen(8080);
app.use(require('helmet')());
https.createServer(options, app).listen(8443);