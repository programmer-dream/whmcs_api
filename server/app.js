const passport = require('passport');
const express = require('express');


const app = express();

require('./config/passport.js');
  
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	res.sendFile('/home/nick/apps/AD-saml/client/index.html');
});

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
var server = app.listen(3000, function(){
});