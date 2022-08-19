const {
  defineConfig
} = require("cypress");

module.exports = defineConfig({
  "e2e": {
    "baseUrl": "https://www.swan.io",
    "numTestsKeptInMemory": 10,
    "viewportWidth": 1920,
    "viewportHeight": 1080,
    "waitForAnimations": true,
    "chromeWebSecurity": false,
    "requestTimeout": 60000,
    "responseTimeout": 120000,
    "pageLoadTimeout": 60000,
    "defaultCommandTimeout": 10000,
    "trashAssetsBeforeRuns": true,
    "downloadsFolder": "cypress/downloads",
    "video": true,
    "videoCompression": false,
    "videoUploadOnPasses": false,
    "blockHosts": [
      "*google-analytics.com",
      "*googleadservices.com",
      "*googletagmanager.com",
      "*criteo.net",
      "*iadvize.com",
      "*msecnd.net",
      "*facebook.net",
      "*hotjar.com"
    ],
    "projectId": "",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});