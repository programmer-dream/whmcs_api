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
const jQuery = require('jquery');
var mysql = require('mysql');



 // middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());
// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({ extended: false }));

/*--------------------------------------------------------------------------------------------------*/
/* 								   Links to configuration files                                     */
/*--------------------------------------------------------------------------------------------------*/

require('./config/passport.js');
const config = require('./config/whmcs.js');
let mysqlconfig = require('./config/sql.js');

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
			var parser = new Saml2js(req.body.SAMLResponse);
			var parsedObject = parser.toObject();

			// Put the tems from the object into js variable
			const email = parsedObject.emailAddress
			const firstname = parsedObject.firstName
			const userid = parsedObject.userId
			const lastname = parsedObject.lastName

		//res.send(email);
		// Decide where the user is going to go, are they new or existing?

		let connection = mysql.createConnection(config);

		connection.query("SELECT email FROM user_idpdetails WHERE email = ?",[email], function(err, result, field){
		//if no result is passed back then the user data should be stored
			if (!result){

					//new user logic
					 //res.send('New User logic');

																			/////////////// Store the variables in the db for later use

																			let connection = mysql.createConnection(mysqlconfig);
																			
																			let stmt = `INSERT INTO user_idpdetails(email,firstname,userid,lastname)
																									VALUES(?,?,?,?)`;
																			let todo = [email, firstname, userid, lastname];
																			
																			// execute the insert statment
																			connection.query(stmt, todo, (err, results, fields) => {
																				if (err) {
																					return res.send(err.message);
																				}
																				

																			});
res.redirect('/home');
connection.end();	 


	 }else{  

//existing user, redirect to another page 
			 //res.send(result);
			 //res.send('Existing User logic');
			 res.redirect('http://whmcs.educationhost.co.uk/clientarea.php');	






		}
					 });



 

			(req, res, next);
         },
);


app.get('/newusersvariables', function(req, res) {
	
	let connection = mysql.createConnection(config);

	connection.query("SELECT userid, email, firstname, lastname FROM user_idpdetails", function(err, result, field){
	
	var newuseremail = result.email;
	var newuseruserid = result.userid;
	var newuserfirstname = result.firstname;
	var newuserlastname = result.lastname;

	res.send(newuseremail);
	
});


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