const express = require("express");

const router = express.Router();
const moment = require("moment");

const path = require("path");

// Gets the client folder which is needed to serve html files

const root = path.join(__dirname, "../../../../AD-saml/client/staff");

var user_idpdetailDal=require("../../../Dal/user_idpdetails");

// @route 	GET /staff/dashboard

// @desc 	Serves the staff dashboard

// @access 	Public

router.get("/dashboard", ensureAuthenticated, function (req, res) {
  // console.log(req.user, "user data");
  res.render("dashboard", {
    email: req.user.upn,
    user: req.user,
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: process.env.Staffticketlink,
          icon: "local_offer",
        },
        {
          label: "Dashboard",
          url: '/staff/dashboard',
          icon: "local_offer",
        },
        {
          label: "Knowledge Base",
          url: process.env.Staffknowledgebaselink,
          icon: "info_outline",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      admin: [
        {
          label: "User Manager",
          // style: " text-bold-700 font-size-large ",
          icon: "group",
        },
        {
          label: "Bulk User Import",
          url: '/staff/bulkUserImport',
          icon: " group_add",
        },
        {
          label: "Add individual user ",
          url: '/staff/addIndividualUser',
          icon: "person_add",
        },
        {
          label: "Remove users ",
          url: '/staff/removeUsers',
          icon: "person_remove",
        }
        
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});


router.get("/bulkUserImport", ensureAuthenticated, function (req, res) {
  // console.log(req.user, "user data");
  res.render("bulkimportuser", {
    email: req.user.upn,
    user: req.user,
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: process.env.Staffticketlink,
          icon: "local_offer",
        },
        {
          label: "Dashboard",
          url: '/staff/dashboard',
          icon: "local_offer",
        },
        {
          label: "Knowledge Base",
          url: process.env.Staffknowledgebaselink,
          icon: "info_outline",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      admin: [
        {
          label: "User Manager",
          // style: " text-bold-700 font-size-large ",
          icon: "group",
        },
        {
          label: "Bulk User Import ",
          url: '/staff/bulkUserImport',
          icon: " group_add",
        },
        {
          label: "Add individual user ",
          url: '/staff/addIndividualUser',
          icon: "person_add",
        },
        {
          label: "Remove users ",
          url: '/staff/removeUsers',
          icon: "person_remove",
        }
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/addIndividualUser", ensureAuthenticated, async function (req, res) {
  
  res.render("addindividualuser", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    modules:await user_idpdetailDal.listModules(),
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: process.env.Staffticketlink,
          icon: "local_offer",
        },

        {
          label: "Knowledge Base",
          url: process.env.Staffknowledgebaselink,
          icon: "info_outline",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      admin: [
        {
          label: "User Manager",
          // style: " text-bold-700 font-size-large ",
          icon: "group",
        },
        {
          label: "Bulk User Import ",
          url: '/staff/bulkUserImport',
          icon: " group_add",
        },
        {
          label: "Add individual user ",
          url: '/staff/addIndividualUser',
          icon: "person_add",
        },
        {
          label: "Remove users ",
          url: '/staff/removeUsers',
          icon: "person_remove",
        }
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/removeUsers", ensureAuthenticated, function (req, res) {
  // console.log(req.user, "user data");
  res.render("removeUsers", {
    email: req.user.upn,
    user: req.user,
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: process.env.Staffticketlink,
          icon: "local_offer",
        },
        {
          label: "Dashboard",
          url: '/staff/dashboard',
          icon: "local_offer",
        },
        {
          label: "Knowledge Base",
          url: process.env.Staffknowledgebaselink,
          icon: "info_outline",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      admin: [
        {
          label: "User Manager",
          // style: " text-bold-700 font-size-large ",
          icon: "group",
        },
        {
          label: "Bulk User Import ",
          url: '/staff/bulkUserImport',
          icon: " group_add",
        },
        {
          label: "Add individual user ",
          url: '/staff/addIndividualUser',
          icon: "person_add",
        },
        {
          label: "Remove users ",
          url: '/staff/removeUsers',
          icon: "person_remove",
        }
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});
// @route 	GET /staff/login

// @desc 	Serves the staff login page

// @access 	Public

router.get("/login", ensureAuthenticated1, function (req, res) {
  res.render("stafflogin");
});

function ensureAuthenticated1(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

function ensureAuthenticated(req, res, next) {
  if (
    req.isAuthenticated() &&
    req.user.isStaff == 1 &&
    req.user.approveStaff == 1
  ) {
    return next();
  }
  req.flash("error_msg", "Your account is not approved yet.");
  res.redirect("/staff/login");
}

module.exports = router;
