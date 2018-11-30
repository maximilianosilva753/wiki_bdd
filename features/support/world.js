const {setWorldConstructor} = require('cucumber');
const testControllerHolder = require('./testControllerHolder');
const base64Img = require('base64-img');
const env = require('./environment').getInstance();

function CustomWorld({attach, parameters}) {
    env.setEnvironment(parameters.env || env.TEST);

    this.waitForTestController = testControllerHolder.get()
        .then(function(tc) {
            return testController = tc;
        });

    this.attach = attach;

    this.setBrowser = function() {
        if (parameters.browser === undefined) {
            return 'chrome';
        } else {
            return parameters.browser;
        }
    };

    this.addScreenshotToReport = function() {
        if (process.argv.includes('--format') || process.argv.includes('-f') || process.argv.includes('--format-options')) {
            testController.takeScreenshot()
                .then(function(screenshotPath) {
                    const imgInBase64 = base64Img.base64Sync(screenshotPath);
                    const imageConvertForCuc = imgInBase64.substring(imgInBase64.indexOf(',') + 1);
                    return attach(imageConvertForCuc, 'image/png');
                })
                .catch(function(error) {
                    console.warn('The screenshot was not attached to the report');
                });
        } else {
            return new Promise((resolve) => {
                resolve(null);
            });
        }
    };

    this.attachScreenshotToReport = function(pathToScreenshot) {
        const imgInBase64 = base64Img.base64Sync(pathToScreenshot);
        const imageConvertForCuc = imgInBase64.substring(imgInBase64.indexOf(',') + 1);
        return attach(imageConvertForCuc, 'image/png');
    };

    this.consoleToReport = function (type, testCase, ...string) {
      var blue = '\033[0;34m', yellow = '\033[0;93m',nc = '\033[0m', bold = '\033[1m';
      string.map(function(text){
        testCase = testCase.replace(/({string})/,`"${text}"`);
      });

      console.warn(`\n ${blue} ${bold} run steps: ${nc} ${yellow} [${type.toUpperCase()}]  ${nc} ${testCase}`);
  }
}

setWorldConstructor(CustomWorld);
