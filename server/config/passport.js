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
		entryPoint: 'https://idp.ssocircle.com/sso/idpssoinit?metaAlias=%2Fpublicidp&spEntityID=nwnwnwnwehapp',
    	issuer: 'https://idp.ssocircle.com',
    	callbackUrl: 'https://idp.ssocircle.com:443/sso/SSORedirect/metaAlias/publicidp',
		privateCert: fs.readFileSync('/home/nick/apps/AD-saml/app.key', 'utf-8'),
    	//cert: fs.readFileSync('/home/nick/apps/AD-saml/app.cer', 'utf-8'),		
		 cert: fs.readFileSync('/home/nick/apps/AD-saml/SSOCircleCACertificate.cer', 'utf-8'),
		 // xml: 'http://idp.ssocircle.com/idp-meta.xml',
    	authnContext: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
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