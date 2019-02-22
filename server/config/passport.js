const fs = require('fs');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

passport.use(new SamlStrategy(
	{
		entryPoint: 'https://adfs.acme_tools.com/adfs/ls/',
    	issuer: 'acme_tools_com',
    	callbackUrl: 'https://acme_tools.com/adfs/postResponse',
    	privateCert: fs.readFileSync('/path/to/acme_tools_com.key', 'utf-8'),
    	cert: fs.readFileSync('/path/to/adfs.acme_tools.com.crt', 'utf-8'),
    	authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
    	acceptedClockSkewMs: -1,
    	identifierFormat: null,
    	signatureAlgorithm: 'sha256'
	},
  	function(profile, done) {
    	return done(null,
			{
        		upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
        		group: profile['http://schemas.xmlsoap.org/claims/Group']
    		}
		);
  	}
));

module.exports = passport;