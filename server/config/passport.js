const fs = require('fs');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const mysql = require("mysql");
const mysqlConfig = require("./sql");
// Get the cpanelAccount from config
const cpanelAccount = require('./whmcs').accountName;
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var config = require('./config');
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
    var email= user._json.email;
    var upn1=email.split("@");
    userid=upn1[0];
    const connection = mysql.createConnection(mysqlConfig);
    connection.connect(function (err) {
        if (err) throw err;

        connection.query(
            "SELECT * FROM user_idpdetails where userid = ?",
            [userid],
            (err, result, fields) => {
                if (err) throw err;
                user.isStaff=result[0].isStaff;
                done(null, user);
            }
        );

        connection.end();
    });



});
// array to hold logged in users
var users = [];

var findByOid = function(oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        console.log('we are using user: ', user);
        if (user.oid === oid) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};


passport.use(new OIDCStrategy({
        identityMetadata: config.creds.identityMetadata,
        clientID: config.creds.clientID,
        responseType: config.creds.responseType,
        responseMode: config.creds.responseMode,
        redirectUrl: config.creds.redirectUrl,
        allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
        clientSecret: config.creds.clientSecret,
        validateIssuer: config.creds.validateIssuer,
        isB2C: config.creds.isB2C,
        issuer: config.creds.issuer,
        passReqToCallback: config.creds.passReqToCallback,
        scope: config.creds.scope,
        loggingLevel: config.creds.loggingLevel,
        loggingNoPII: config.creds.loggingNoPII,
        nonceLifetime: config.creds.nonceLifetime,
        nonceMaxAmount: config.creds.nonceMaxAmount,
        useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
        cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
        clockSkew: config.creds.clockSkew,
    },
    function(iss, sub, profile, accessToken, refreshToken, done) {
        if (!profile.oid) {
            return done(new Error("No oid found"), null);
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
            findByOid(profile.oid, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    // "Auto-registration"
                    users.push(profile);
                    return done(null, profile);
                }
                return done(null, user);
            });
        });
    }
));




module.exports = passport;
