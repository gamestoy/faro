const puppeteer = require('puppeteer');
const fs = require('fs');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const Config = require('./config');

const { Devices, Network } = require('./emulate');

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_TMP_PATH = './traces.json';

class Chrome {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }

  async _getPage(browser) {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT);
    await page.emulate(Devices[this.options.device]);
    return page;
  }

  async _initializeClient(page) {
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await client.send('Network.enable');
    await client.send('Emulation.setCPUThrottlingRate', { rate: this.options.cpu });
    await client.send('Network.emulateNetworkConditions', Network[this.options.network]);
    return client;
  }

  async _createMetricFromPerformanceEntries(page, type) {
    return await page.evaluate(t => {
      return performance.getEntriesByType(t).map(entry => {
        return { name: entry.name, value: Math.ceil(entry.startTime) };
      });
    }, type);
  }

  async _createMainDocumentMetrics(page) {
    return await page.evaluate(() => {
        const obj = performance.timing;
        const navigationStart = obj.navigationStart;
        const duration = obj.responseEnd - navigationStart;
        const requestStart = obj.requestStart - navigationStart;
        const responseStart = obj.responseStart - navigationStart;

        return { duration: duration, requestStart: requestStart, responseStart: responseStart };
      });
  }

  async _createResourceEntries(page) {
    return await page.evaluate(() =>
      performance.getEntriesByType('resource').map(e => {
        return {
          name: e.name,
          value: e.startTime,
          duration: e.duration,
          transferSize: e.transferSize,
          requestStart: e.requestStart,
          responseEnd: e.responseEnd,
          responseStart: e.responseStart,
        };
      })
    );
  }

  static async _getMetricsFromDevtool(client) {
    const ms = await client.send('Performance.getMetrics');
    const fmp = ms.metrics.find(x => x.name === 'FirstMeaningfulPaint').value;
    if (fmp !== 0) {
      const ns = ms.metrics.find(x => x.name === 'NavigationStart').value;
      const dcl = ms.metrics.find(x => x.name === 'DomContentLoaded').value;
      return [
        { name: 'first-meaningful-paint', value: Math.ceil((fmp - ns) * 1000) },
        { name: 'dom-content-loaded', value: Math.ceil((dcl - ns) * 1000) },
      ];
    } else {
      return [];
    }
  }

  async _getPerformanceMetrics(page, client) {
    const devtoolMetrics = await Chrome._getMetricsFromDevtool(client);
    const marks = await this._createMetricFromPerformanceEntries(page, 'mark');
    const paintMetrics = await this._createMetricFromPerformanceEntries(page, 'paint');
    const mainDocument = await this._createMainDocumentMetrics(page);
    const resources = await this._createResourceEntries(page);
    return devtoolMetrics.concat(paintMetrics, marks, resources, mainDocument);
  }

  static async _withBrowser(f) {
    const browser = await puppeteer.launch();
    const v = await f(browser);
    await browser.close();
    return v;
  }

  async _trace(page) {
    await page.tracing.start({ path: DEFAULT_TMP_PATH, categories: Config.getChromeTracesCategories() });
    await page.goto(this.url, { waitUntil: ['load', 'networkidle0'] });
    await page.tracing.stop();
    return await Chrome._getEventsFromFile(DEFAULT_TMP_PATH);
  }

  async getEvents() {
    return await Chrome._withBrowser(async browser => {
      const page = await this._getPage(browser);
      const client = await this._initializeClient(page);
      const events = await this._trace(page);
      const performanceMetrics = await this._getPerformanceMetrics(page, client);

      const devtoolModel = new DevtoolsTimelineModel(events);

      return {
        metrics: performanceMetrics,
        traces: devtoolModel,
      };
    });
  }

  static _getEventsFromFile(path) {
    const data = fs.readFileSync(path, 'utf8');
    fs.unlinkSync(path);
    return JSON.parse(data);
  }
}

module.exports = Chrome;
