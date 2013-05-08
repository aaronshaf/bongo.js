basePath = '';
urlRoot = '/karma/';
files = [
  JASMINE,
  JASMINE_ADAPTER,
  '../libs/indexedDBShim.js',
  '../src/bongo.es5.js',
  'spec/BongoSpec.js'
];
exclude = [];
reporters = ['progress'];
port = 9876;
runnerPort = 9100;
colors = true;
logLevel = LOG_INFO;
autoWatch = true;
browsers = ['Chrome']; //,'IE' ,'Safari','Opera','ChromeCanary','Firefox'
captureTimeout = 60000;
singleRun = false;