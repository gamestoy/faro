const puppeteer = require("puppeteer");
const CHC = require("chrome-har-capturer");

async function retrieveHAR(url, debugPort) {
  return new Promise(resolve => {
    CHC.run([url], {
      port: debugPort,
    }).on("har", har => {
      resolve(har);
    });
  });
}

async function getHAR(url) {
  const debugPort = 9222;
  const browser = await puppeteer.launch({ args: ["--remote-debugging-port=" + debugPort] });
  const har = await retrieveHAR(url, debugPort);

  await browser.close();

  return har;
}

module.exports = {
  getHAR: getHAR,
};
