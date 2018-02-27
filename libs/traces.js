const puppeteer = require("puppeteer");
const fs = require("fs");

function retrieveTraces(path) {
  return new Promise(resolve => {
    fs.readFile(path, (err, data) => {
      fs.unlink(path, () => {
        resolve(JSON.parse(data));
      });
    });
  });
}

async function getTraces(url) {
  const tmpPath = "./trace.json";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send("Performance.enable");
  await client.send("Network.enable");
  await page.tracing.start({ path: tmpPath });

  await page.goto(url, { waitUntil: ["load", "networkidle0"] });

  const metrics = await page.evaluate(() => {
    const marks = {};
    performance.getEntriesByType("paint").map(entry => {
      marks[entry.name] = entry.startTime;
    });
    performance.getEntriesByType("mark").map(entry => {
      marks[entry.name] = entry.startTime;
    });
    const init = performance.timing.navigationStart;
    return { init: init, marks: marks };
  });

  await page.tracing.stop();

  await browser.close();

  const traces = await retrieveTraces(tmpPath);

  return { metrics: metrics, traces: traces };
}

module.exports = {
  getTraces: getTraces,
};
