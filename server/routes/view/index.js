const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');

// Gets the client folder which is needed to serve html files
const root = path.join(__dirname, '../../../client');

// @route	GET /test
// @desc	Serves the test page
// @access 	Public
router.get("/test", (req, res) => {
	res.sendFile('test.html', {
		root
	});
});

// @route 	GET /
// @desc 	Serves the landing page
// @access 	Public
router.get("/", (req, res) => {
	res.sendFile('index.html', {
		root
	});
});

// @route 	GET /home
// @desc 	Serves the home page
// @access 	Public
router.get("/home",ensureAuthenticated, (req, res) => {
	res.sendFile('home.html', {
		root
	});
});

// @route 	GET /whmcs
// @desc 	Serves the whmcs page
// @access 	Public
router.get("/whmcs", (req, res) => {
	res.sendFile('whmcs.html', {
		root
	});
});

// @route 	GET /handlebars
// @desc 	Serves the handlebars page
// @access 	Public
router.get("/handlebars", (req, res) => {
	res.sendFile('handlebars.html', {
		root
	});
});

// @route 	GET /logout
// @desc 	Logs the user out and redirects to the landing page
// @access 	Public
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

// @route 	GET /login
// @desc 	Redirects either to the homepage or faillogin page, depending on authentication
// @access 	Private
router.get('/login',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    function(req, res) {
        console.log('Login was called in the Sample');
        res.redirect("/home");
    });



function ensureAuthenticated(req, res, next) {
	var a=req.isAuthenticated();
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
module.exports = router;
