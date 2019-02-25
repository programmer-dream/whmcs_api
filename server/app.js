/*--------------------------------------------------------------------------------------------------*/
/* 								      Required node modules                                         */
/*--------------------------------------------------------------------------------------------------*/

const passport = require('passport');
const express = require('express');
const WHMCS = require('whmcs');

const app = express();

/*--------------------------------------------------------------------------------------------------*/
/* 								   Links to configuration files                                     */
/*--------------------------------------------------------------------------------------------------*/

require('./config/passport.js');
require('./config/whmcs.js');
  
app.use(passport.initialize());
app.use(passport.session());
//app.use(whmcs.initialize());

app.get('/', function(req, res) {
	res.sendFile('/home/nick/apps/AD-saml/client/index.html');
});

app.get('/test', function(req, res) {
	res.sendFile('/home/nick/apps/AD-saml/client/test.html');
});

/*--------------------------------------------------------------------------------------------------*/
/* 										WHMCS Routes                                                */
/* 			       	Anything in the WHMCS routes can be called from axios in the html               */
/*--------------------------------------------------------------------------------------------------*/

app.get('/whmcs', function(req, res) {
	res.sendFile('/home/nick/apps/AD-saml/client/whmcs.html');
});

app.get('/listallwhmcsusers', function(req, res) {
	var config = {
    username: 'uqIfuB386o8vubPz9xTInHp25bQps8EH',
    password: '2saQiTPgbSIyvUtmSwVBjmqQxPJ58IpR',
    apiKey: 'uqIfuB386o8vubPz9xTInHp25bQps8EH', // if access without IP restriction
    serverUrl: 'http://whmcs.educationhost.co.uk/includes/api.php'
	};
	
var wclient = new WHMCS(config);

wclient.customers.getTopCustomer = function (callback) {
  var options = {
    action: 'gettopcustomer'
  };

  var opts = {
    client: this,
    body: options
  };

  wclient.utils.modem(opts, callback);
};       

});

/*--------------------------------------------------------------------------------------------------*/
/* 							Assets folders that can be called from html                             */
/* 			       	Anything in the assets folder can be referenced in the html                     */
/*--------------------------------------------------------------------------------------------------*/
app.use(express.static('assets'));

app.get('/login',
	passport.authenticate('saml', { failureRedirect: '/home/nick/apps/AD-saml/client/loginFailed', failureFlash: true }),
    function(req, res) {
		res.redirect('/home');
	}
);
  
app.post('/adfs/postResponse',
	passport.authenticate('saml', { failureRedirect: '/home/nick/apps/AD-saml/client/loginFailed', failureFlash: true }),
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
	res.sendFile('/home/nick/apps/AD-saml/client/home.html');
});
/*
var server = http.createServer(app);
*/
var server = app.listen(8080, function(){
});