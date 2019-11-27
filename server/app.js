// Import required modules
const express = require("express");
const app = express();
const passport = require("passport");
const https = require("https");
const fs = require("fs");

const bodyParser = require("body-parser");
const cors = require('cors');
const session = require("express-session");
const cpanel = require('cpanel-lib');

require("./config/passport.js");
var cookieParser = require('cookie-parser');
app.use(cookieParser());
// Get the cpanelAccount from config
//const cpanelAccount = require('../../config').cpanelAccount;
const cpanelAccount = require('./config/whmcs').accountName;

const cpoptions = require("./config/cpanel.js");
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: "EHsecret",
        expires: new Date(Date.now() + 30 * 86400 * 1000)
    })
);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')
/*
app.use('/accounts', function (req, res) {


  //var cpanelClient = cpanel.Fileman(options);
  var cpanelClient = cpanel.createClient({});

  cpanelClient.call('listaccts', { 'api.version': 1, search: 'ud' }, function (error, data) {
    console.log('listaccts');

    if (error) {
      return res.send({
        ok: false,
        error: error
      });
    }

    return res.send({
      ok: true,
      data: data
    })

  });

});
*/

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

app.listen(8080);
app.use(require("helmet")());
https.createServer( app).listen(8443);
