const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const { DateTime } = require("luxon");

// Gets the client folder which is needed to serve html files
const root = path.join(__dirname, '../../../client');
const user_idpdetailBal=require("../../../Bal/user_idpdetails");
var user_idpdetailDal=require("../../../Dal/user_idpdetails");
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
router.get("/", async (req, res) => {
	let setting = await user_idpdetailDal.listEnablevalue()
	res.render("index",{setting:setting});
});

// @route 	GET /home
// @desc 	Serves the home page
// @access 	Public
router.get("/home",ensureAuthenticated, async (req, res) => {
	let todayDate     = DateTime.now().toFormat('yyyy-MM-dd');
	let intakePeriod  = await user_idpdetailDal.getIntakePeriod(todayDate)
	//console.log(intakePeriod, "<< intakePeriod2")
    user_idpdetailBal.getUserBySessionId(req.sessionID,function (data,err) {
		if(data.message=="success"){
			user_idpdetailBal.getModules(data.data[0].client_detail.dataValues.universityid,async function (data1,err1) {
                if(data.message=="success"){
                    var domain=data.data[0].dataValues.userid+"."+data.data[0].client_detail.dataValues.domainname;
                    var teachingLocation =await user_idpdetailDal.listTeachingLocation()
    				//var teachingBlockPeriods =await user_idpdetailDal.listBlockPeriods()
    				var isSettingEnabled =await user_idpdetailDal.listEnablevalue()
                    if(data1.data.length>0){
                    	
                        res.render("home",{domain:domain,
                        					option:data1.data[0].dataValues,
                        					teachingLocation:teachingLocation,
                        					teachingBlockPeriods:intakePeriod,
                        					ID : data.data[0].dataValues.ID,
                        					isCourseEnabled :isSettingEnabled.module_courses_enabled,
                        					isSettingEnabled :isSettingEnabled
                        				});
					}else{
                    	res.send("There are no modules in database");
					}

                }
            })

		}
    })

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

router.get("/varifylogin",function (req,res) {
	if(req.isAuthenticated()==true){
		res.redirect("/api/user/varifyuser")
	}else {
		res.redirect("/login")
	}
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
module.exports = router;
