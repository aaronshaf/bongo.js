basePath = '';
urlRoot = '/karma/';
files = [
  MOCHA,
  MOCHA_ADAPTER,
  'lib/chai.js',
  '../src/js/bongo.es5.js',
  'spec/*Spec.js'
];
exclude = [];
reporters = ['progress'];
port = 9876;
runnerPort = 9100;
colors = true;
logLevel = LOG_INFO;
autoWatch = true;
browsers = ['Chrome','ChromeCanary','Firefox']; // Add 'IE' if you're on Windows
captureTimeout = 60000;
singleRun = true;