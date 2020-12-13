const express = require("express");

const router = express.Router();
const moment = require("moment");

const path = require("path");

// Gets the client folder which is needed to serve html files

const root = path.join(__dirname, "../../../../AD-saml/client/staff");

// @route 	GET /staff/dashboard

// @desc 	Serves the staff dashboard

// @access 	Public

router.get("/dashboard", ensureAuthenticated, function(req, res) {
  res.render("dashboard", {
    email: req.user.upn,
    user: req.user,
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: "http://support.example.com/",
          icon: "local_offer"
        },
        {
          label: "FAQ",
          url: "https://ssotesting.educationhost.co.uk/staff/faq.html",
          icon: "help_outline"
        },
        {
          label: "Knowledge Base",
          url:
            "https://whmcs.educationhost.co.uk/clientarea/index.php?rp=/knowledgebase",
          icon: "info_outline"
        }
      ],
      other: [
        {
          label: "Admin Area",
          url: "https://ssotesting.educationhost.co.uk/staff/news-feed.html",
          icon: "list_alt"
        },
        {
          label: "Network Monitor",
          url: "https://uptime.statuscake.com/?TestID=PzBTSXZwia",
          icon: "list_alt"
        }
      ]
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`
  });
});

// @route 	GET /staff/login

// @desc 	Serves the staff login page

// @access 	Public

router.get("/login", ensureAuthenticated1, function(req, res) {
  res.render("stafflogin");
});

function ensureAuthenticated1(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isStaff == 1) {
    return next();
  }

  res.redirect("/");
}

module.exports = router;
