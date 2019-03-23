const fs = require('fs');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;


passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(new SamlStrategy(
	{
		entryPoint: 'https://idp.ssocircle.com/sso/idpssoinit?metaAlias=%2Fpublicidp&spEntityID=nwehappwithlinktoesponserouteHTTPSAUTHDOMAIN',
		issuer: 'https://idp.ssocircle.com',
		callbackUrl: '/login/callback',
		// OLD KEY privateCert: fs.readFileSync('/home/nick/apps/AD-saml/app.key', 'utf-8'),
		privateCert: fs.readFileSync('/home/xhgkhpdb/AD-saml/sslcert/privkey.pem', 'utf-8'),
		//cert: fs.readFileSync('/home/nick/apps/AD-saml/app.cer', 'utf-8'),		
		cert: fs.readFileSync('/home/xhgkhpdb/AD-saml/SSOCircleCACertificate.cer', 'utf-8'),
		// xml: 'http://idp.ssocircle.com/idp-meta.xml',
		authnContext: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
		acceptedClockSkewMs: -1,
		identifierFormat: null,
		signatureAlgorithm: 'sha256'
	},
	function (profile, done) {
		return done(null,
			{
				upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
				group: profile['http://schemas.xmlsoap.org/claims/Group'],
				id: profile.uid,
				email: profile.email,
				displayName: profile.cn,
				firstName: profile.givenName,
				lastName: profile.sn
			}
		);
	}
));

module.exports = passport;