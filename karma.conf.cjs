const fs = require('fs');

const posiblesRutasNavegador = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

for (const ruta of posiblesRutasNavegador) {
  if (fs.existsSync(ruta)) {
    process.env.CHROME_BIN = ruta;
    break;
  }
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      { pattern: 'src/utils/**/*.js', type: 'module' },
      { pattern: 'src/tests/**/*.spec.js', type: 'module' }
    ],

    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    browserNoActivityTimeout: 30000
  });
};