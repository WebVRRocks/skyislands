/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */

function isEnabled (val) {
  val = val || '';
  return val !== '' && val !== '0' && val !== 'false' && val !== 'off';
}

function getEnvVar (name, defaultVal) {
  return name in process.env ? isEnabled(name) : defaultVal;
}

var isDev = process.env.NODE_ENVIRONMENT === 'development';

module.exports = {
  server: '.',
  files: [
    '**',
    '!*\.{7z,com,class,db,dll,dmg,exe,gz,iso,jar,o,log,so,sql,sqlite,tar,zip}',
    '!node_modules'
  ],
  watchOptions: {
    ignoreInitial: true
  },
  open: getEnvVar('BS_OPEN', isDev),
  notify: getEnvVar('BS_NOTIFY', false),
  tunnel: getEnvVar('BS_TUNNEL', isDev),
  minify: getEnvVar('BS_MINIFY', isDev)
};
