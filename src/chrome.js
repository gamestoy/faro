const puppeteer = require('puppeteer');
const fs = require('fs');
const { CHROME_TRACES_CATEGORIES } = require('./traces');
const { DEVICES, NETWORK } = require('./emulate');

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_TMP_PATH = './traces.json';

async function getPage(browser, options) {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT);
  await page.emulate(DEVICES[options.device]);
  return page;
}

async function getClient(page, options) {
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');
  await client.send('Network.enable');
  await client.send('Emulation.setCPUThrottlingRate', { rate: options.cpu });
  await client.send('Network.emulateNetworkConditions', NETWORK[options.network]);
  return client;
}


async function createMetricFromPerformanceEntries(page, type) {
  return await page.evaluate(t => {
    return performance.getEntriesByType(t).map(entry => {
      return { name: entry.name, value: Math.ceil(entry.startTime) };
    });
  }, type);
}

async function getMetricsFromDevtool(client) {
  const ms = await client.send('Performance.getMetrics');
  const fmp = ms.metrics.find(x => x.name === 'FirstMeaningfulPaint').value;
  if (fmp !== 0) {
    const ns = ms.metrics.find(x => x.name === 'NavigationStart').value;
    const dcl = ms.metrics.find(x => x.name === 'DomContentLoaded').value;
    return [
      { name: 'first-meaningful-paint', value: Math.ceil((fmp - ns) * 1000) },
      { name: 'dom-content-loaded', value: Math.ceil((dcl - ns) * 1000) }
    ];
  } else {
    return [];
  }
}

async function getPerformanceMetrics(page, client) {
  const devtoolMetrics = await getMetricsFromDevtool(client);
  const marks = await createMetricFromPerformanceEntries(page, 'mark');
  const paintMetrics = await createMetricFromPerformanceEntries(page, 'paint');
  return devtoolMetrics.concat(paintMetrics, marks);
}

async function withBrowser(f) {
  const browser = await puppeteer.launch();
  const v = await f(browser);
  await browser.close();
  return v;
}

async function trace(page, url) {
  await page.tracing.start({ path: DEFAULT_TMP_PATH, categories: CHROME_TRACES_CATEGORIES });
  await page.goto(url, { waitUntil: ['load', 'networkidle0'] });
  await page.tracing.stop();
  return await getTracesFromFile(DEFAULT_TMP_PATH);
}

async function getData(url, options) {
  return await withBrowser(async browser => {
    const page = await getPage(browser, options);
    const client = await getClient(page, options);
    const traces = await trace(page, url);
    const performanceMetrics = await getPerformanceMetrics(page, client);

    return { metrics: performanceMetrics, traces: traces };
  });
}

function getTracesFromFile(path) {
  return new Promise(resolve => {
    fs.readFile(path, (err, data) => {
      fs.unlink(path, () => {
        resolve(JSON.parse(data));
      });
    });
  });
}

module.exports = {
  getData
};
