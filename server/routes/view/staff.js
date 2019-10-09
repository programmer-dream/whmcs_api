const express = require('express');
const router = express.Router();
const path = require('path');

// Gets the client folder which is needed to serve html files
const root = path.join(__dirname, '../../../../AD-saml/client/staff');




// @route 	GET /staff/dashboard
// @desc 	Serves the staff dashboard
// @access 	Public
router.get("/dashboard", function (req, res) {
	res.sendFile('dashboard.html', {
		root
	});
});

// @route 	GET /staff/login
// @desc 	Serves the staff login page
// @access 	Public
router.get("/login", function (req, res) {
	res.sendFile('index.html', {
		root
	});
});

module.exports = router;