const puppeteer = require('puppeteer');
const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const fs = require('fs');
const R = require('ramda');
const Config = require('./config');

const { Devices, Network } = require('./emulate');

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_TMP_PATH = './traces.json';

class Chrome {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.recording = false;
  }

  async _getPage(browser) {
    const page = await browser.newPage();
    await this._setHeaders(page);
    await page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT);
    await page.emulate(Devices[this.options.device]);
    return page;
  }

  async _startRecording(page) {
    await page.tracing.start({ path: DEFAULT_TMP_PATH, categories: Config.getChromeTracesCategories() });
    this.recording = true;
  }

  async _stopRecording(page) {
    if (this.recording) {
      await page.tracing.stop();
      this.recording = false;
    }
  }

  async _setHeaders(page) {
    if (!R.isNil(this.options.headers)) {
      const headers = {};
      this.options.headers.forEach(h => {
        const header = h.split('=');
        headers[header[0]] = header[1];
      });
      await page.setExtraHTTPHeaders(headers);
    }
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
    return devtoolMetrics.concat(paintMetrics, marks);
  }

  static async _withBrowser(f) {
    const browser = await puppeteer.launch();
    const v = await f(browser);
    await browser.close();
    return v;
  }

  async _trace(page) {
    try {
      if (!R.isNil(this.options.mark)) {
        page.on('metrics', async obj => {
          if (obj.title === this.options.mark) {
            await this._stopRecording(page);
          }
        });
      }
      await this._startRecording(page);
      await page.goto(this.url, { waitUntil: ['load', 'networkidle0'] });
      await this._stopRecording(page);

      return await S.Just(Chrome._getEventsFromFile(DEFAULT_TMP_PATH));
    } catch (e) {
      return S.Nothing;
    }
  }

  async getEvents() {
    return await Chrome._withBrowser(async browser => {
      const page = await this._getPage(browser);
      const client = await this._initializeClient(page);
      const events = await this._trace(page);
      //To avoid Maybe of a Promise when calling performance metrics.
      if (S.isJust(events)) {
        const pm = await this._getPerformanceMetrics(page, client);
        return S.map(e => {
          return {
            metrics: pm,
            traces: e,
          };
        }, events);
      } else {
        return S.Nothing;
      }
    });
  }

  static _getEventsFromFile(path) {
    const data = fs.readFileSync(path, 'utf8');
    fs.unlinkSync(path);
    return JSON.parse(data);
  }
}

module.exports = Chrome;
