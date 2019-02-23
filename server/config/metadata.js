const os = require('os');
const fileCache = require('file-system-cache').default;
const { fetch, toPassportConfig, claimsToCamelCase } = require('passport-saml-metadata');
const SamlStrategy = require('passport-wsfed-saml2').Strategy;
 
const backupStore = fileCache({ basePath: os.tmpdir() });
const url = 'https://idp.ssocircle.com/idp-meta.xml';
 
fetch({ url, backupStore })
  .then((reader) => {
    const config = toPassportConfig(reader);
    config.realm = 'urn:nodejs:passport-saml-metadata-example-app';
    config.protocol = 'saml2';
 
    passport.use('saml', new SamlStrategy(config, function(profile, done) {
      profile = claimsToCamelCase(profile, reader.claimSchema);
      done(null, profile);
    }));
 
    passport.serializeUser((user, done) => {
      done(null, user);
    });
 
    passport.deserializeUser((user, done) => {
      done(null, user);
    });
  });