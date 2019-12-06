const express = require('express');
const router = express.Router();
const path = require('path');

// Gets the client folder which is needed to serve html files
const root = path.join(__dirname, '../../../../AD-saml/client/staff');




// @route 	GET /staff/dashboard
// @desc 	Serves the staff dashboard
// @access 	Public
router.get("/dashboard",ensureAuthenticated, function (req, res) {
	res.render('dashboard',{email:req.user.upn});
});

// @route 	GET /staff/login
// @desc 	Serves the staff login page
// @access 	Public
router.get("/login",ensureAuthenticated1, function (req, res) {
	res.sendFile('index.html', {
		root
	});
});
function ensureAuthenticated1(req, res, next) {

    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.isStaff==1) { return next(); }
    res.redirect('/');
};
module.exports = router;