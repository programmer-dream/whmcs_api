const express = require("express");
const { DateTime } = require("luxon");
const router = express.Router();
const moment = require("moment");

const path = require("path");

// Gets the client folder which is needed to serve html files

const root = path.join(__dirname, "../../../../AD-saml/client/staff");

var user_idpdetailDal=require("../../../Dal/user_idpdetails");

// @route 	GET /staff/dashboard

// @desc 	Serves the staff dashboard

// @access 	Public

router.get("/dashboard", ensureAuthenticated, async function (req, res) {

  // console.log(req.user, "user data");
  res.render("dashboard", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});


router.get("/bulkUserImport", ensureAuthenticated, async function (req, res) {
  // console.log(req.user, "user data");
  res.render("bulkimportuser", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    availableteachinglocations:await user_idpdetailDal.availableTeachingLocations(),
    availablemodules:await user_idpdetailDal.getAvailableModules(),
    availablecoursesbulkuploader:await user_idpdetailDal.availablecoursesbulkuploader(),
    availableintakesbulkuploader:await user_idpdetailDal.availableintakesbulkuploader(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
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
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    settingEnabled: await user_idpdetailDal.listEnablevalue(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/removeUsers", ensureAuthenticated, async function (req, res) {
  // console.log(req.user, "user data");
  res.render("removeUsers", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});
router.get("/userManager", ensureAuthenticated,async function (req, res) {
  // console.log(req.user, "user data");
  res.render("usermanager", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/settings", ensureAuthenticated, async function (req, res) {
  
  res.render("settings", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(true),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    modules:await user_idpdetailDal.listModules(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    clientDetail:await user_idpdetailDal.clientDetail(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/moduleadd", ensureAuthenticated, async function (req, res) {
  
  res.render("moduleadd", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    allModulesList:await user_idpdetailDal.getListModules(),
    settings:await user_idpdetailDal.listEnablevalue(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    courseList:await user_idpdetailDal.courseList(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});
router.get("/moduleassignusers", ensureAuthenticated, async function (req, res) {
  
  res.render("moduleassignusers", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    modules:await user_idpdetailDal.listModules(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});
router.get("/moduleatl", ensureAuthenticated, async function (req, res) {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    let dtoday = now.toISOString().slice(0,16);


  
  res.render("moduleatl", {
    email: req.user.upn,
    user: req.user,
    dtoday:dtoday,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    modules:await user_idpdetailDal.listModules(),
    allmodules:await user_idpdetailDal.getAllmodules(),
    modulesWithDuedates: await user_idpdetailDal.listModuleswithdates(),
    modulesRecentlyEnd:await user_idpdetailDal.modulesRecentlyEnd(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    module_agent : await module_status(),
    DateTime:DateTime,
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});
router.get("/modulestudentview", ensureAuthenticated, async function (req, res) {
  
  res.render("modulestudentview", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    listCourse:await user_idpdetailDal.listCourse(),
    getTeachingBlocks:await user_idpdetailDal.getTeachingBlocks(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/modulecourses", ensureAuthenticated, async function (req, res) {
  
  res.render("modulecourses", {
    email: req.user.upn,
    user: req.user,
    allcoursesdate:await user_idpdetailDal.listcoursesdate(),
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    courseLocations:await user_idpdetailDal.courseLocations(),
    courseList:await user_idpdetailDal.courseList(),
    listCourse:await user_idpdetailDal.listCourse(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/blockmanageblocks", ensureAuthenticated, async function (req, res) {
  
  res.render("blockmanageblocks", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    modules:await user_idpdetailDal.listModules(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    getTeachingBlocks:await user_idpdetailDal.getTeachingBlocks(),
    courseList:await user_idpdetailDal.courseList(),
    listCourse:await user_idpdetailDal.listCourse(),
    teaching_block_agent:await teaching_block_agent(),
    DateTime:DateTime,
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/blockstudentextensions", ensureAuthenticated, async function (req, res) {
  
  res.render("blockstudentextensions", {
    email: req.user.upn,
    user: req.user,
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    listCourse:await user_idpdetailDal.listCourse(),
    getTeachingBlocks:await user_idpdetailDal.getTeachingBlocks(),
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
        }
                
      ],
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`,
  });
});

router.get("/blockintakeperiods", ensureAuthenticated, async function (req, res) {
  
  res.render("blockintakeperiods", {
    email: req.user.upn,
    user: req.user,
    teachingLocation:await user_idpdetailDal.listTeachingLocation(),
    teachingBlockPeriods:await user_idpdetailDal.listBlockPeriods(),
    allIntakesList:await user_idpdetailDal.getListIntakes(),
    modules:await user_idpdetailDal.listModules(),
    enabledisablevalue:await user_idpdetailDal.listEnablevalue(),
    activeintakecount:await user_idpdetailDal.activeintakecount(),
    DateTime:DateTime,
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
      blocks: [
        {
          label: "Manage Blocks",
          url: '/staff/blockmanageblocks',
          icon: "view_timeline",
        },
        {
          label: "Student Extensions",
          url: '/staff/blockstudentextensions',
          icon: "assignment_turned_in",
        },
        {
          label: "Intake Periods",
          url: '/staff/blockintakeperiods',
          icon: "start",
        },
      ],
      other: [
        {
          label: "Network Monitor",
          url: process.env.Networkmonitorlink,
          icon: "list_alt",
        },
      ],
      modules: [
        {
          label: "Manage Modules",
          url: '/staff/moduleadd',
          icon: "folder_special",
        },
        {
          label: "Courses",
          url: '/staff/modulecourses',
          icon: "featured_play_list",
        },
        {
          label: "Assign users",
          url: '/staff/moduleassignusers',
          icon: "rule_folder",
        },
        {
          label: "Module Dates",
          url: '/staff/moduleatl',
          icon: "date_range",
        },
        {
          label: "Student view",
          url: '/staff/modulestudentview',
          icon: "folder_shared",
        },
      ],

      admin: [
        {
          label: "User Manager",
          url: '/staff/userManager',
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
        ,
        {
          label: "Settings ",
          url: '/staff/settings',
          icon: "settings",
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

router.get("/login", ensureAuthenticated1, async function (req, res) {
  let setting = await user_idpdetailDal.listEnablevalue()
  res.render("stafflogin",{setting:setting});
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
async function module_status (){
  let setting = await user_idpdetailDal.listEnablevalue()
  //console.log(setting, "<<< setting")
    if(setting.cron_running_date){
      let endDate = DateTime.now();
      let strDate  = setting.cron_running_date;
          strDate  = strDate.toISOString().replace('Z','')
      let startDate = DateTime.fromISO(strDate);
      let minDiff = endDate.diff(startDate).as('minutes');
      //console.log(minDiff, "<< minDiff")
      return parseInt(minDiff);
    }else{
      return null;
    }
  }

  async function teaching_block_agent (){
  let setting = await user_idpdetailDal.listEnablevalue()
    //console.log(setting, "<<< setting 1")
    if(setting.block_cron_running){
      let endDate = DateTime.now();
      //console.log(endDate, "<<< endDate 2")
      let strDate  = setting.block_cron_running;
        strDate  = strDate.toISOString().replace('Z','')
      let startDate = DateTime.fromISO(strDate);
      let minDiff = endDate.diff(startDate).as('minutes');
      //console.log(minDiff, "<< minDiff 3")
      return parseInt(minDiff);
    }else{
      return null;
    }
  }

module.exports = router;
