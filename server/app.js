// Import required modules
const express = require("express");
const app = express();
const passport = require("passport");
const https = require("https");
const fs = require("fs");
require('dotenv').config()
const bodyParser = require("body-parser");
const cors = require('cors');
var Sequelize = require('sequelize')
const session = require("express-session");
var cookieParser = require('cookie-parser');
//using mysql for session
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var dbconfig=require("./config/sql");
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// create database, ensure 'sqlite3' in your package.json
var sequelize = new Sequelize(
    dbconfig.database,
    dbconfig.user,
    dbconfig.password, {
        "dialect": "mysql",
        "storage": "session"
    });

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: "EHsecret",
        expires: new Date(Date.now() + 30 * 86400 * 1000),
        store: new SequelizeStore({
            db: sequelize
        }),
    })
);
const cpanel = require('cpanel-lib');

require("./config/passport.js");

app.use(cookieParser());
// Get the cpanelAccount from config
//const cpanelAccount = require('../../config').cpanelAccount;
const cpanelAccount = require('./config/whmcs').accountName;

const cpoptions = require("./config/cpanel.js");


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')

app.use(cors());

// middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());

// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({
	extended: false
}));

// Initialise passport
app.use(passport.initialize());
app.use(passport.session());

// Assets folder is static so it's contents can be used in html pages
app.use(express.static("assets"));
var flash = require('connect-flash');

app.use(flash());
app.use(function (req, res, next) {
    res.locals.error_msg = req.flash('error_msg');
    next();
});
// View
const rootRoutes = require('./routes/view');
const staffRoutes = require('./routes/view/staff');

app.use('/', rootRoutes);
app.use('/staff', staffRoutes)

// API
const accountRoutes = require('./routes/api/account');
const staffRoutesAPI = require('./routes/api/staff');
const studentRoutes = require('./routes/api/student');
const userRoutes = require('./routes/api/user');

app.use('/api/account', accountRoutes);
app.use('/api/staff', staffRoutesAPI);
app.use('/api/student', studentRoutes);
app.use('/api/user', userRoutes);


////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Link to fullchain and private cert /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Create server and HTTPS connection//////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT);
app.use(require("helmet")());
https.createServer( app).listen(8445);
