basePath = '';
urlRoot = '/karma/';
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'libs/*.js',
  'bongo.js',
  'tests/*.js'
];
exclude = [];
reporters = ['progress'];
port = 9876;
runnerPort = 9100;
colors = true;
logLevel = LOG_INFO;
autoWatch = true;
browsers = ['Chrome','Safari','Opera','ChromeCanary','Firefox']; //,'IE'
captureTimeout = 60000;
singleRun = false;