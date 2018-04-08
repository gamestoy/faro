const devices = require('puppeteer/DeviceDescriptors');

const Network = {
  '2g': {
    offline: false,
    latency: 800,
    downloadThroughput: 280000,
    uploadThroughput: 250000,
  },
  '3gSlow': {
    offline: false,
    latency: 400,
    downloadThroughput: 400000,
    uploadThroughput: 400000,
  },
  '3g': {
    offline: false,
    latency: 300,
    downloadThroughput: 1600000,
    uploadThroughput: 768000,
  },
  '3gFast': {
    offline: false,
    latency: 170,
    downloadThroughput: 1600000,
    uploadThroughput: 768000,
  },
  '4g': {
    offline: false,
    latency: 150,
    downloadThroughput: 9000000,
    uploadThroughput: 9000000,
  },
  lte: {
    offline: false,
    latency: 70,
    downloadThroughput: 12000000,
    uploadThroughput: 12000000,
  },
  cable: {
    offline: false,
    latency: 28,
    downloadThroughput: 5000000,
    uploadThroughput: 1000000,
  },
  native: {
    offline: false,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  },
};

const Devices = {
  desktop: {
    viewport: {
      width: 1920,
      height: 1080,
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  },
  mobile: devices['Nexus 6'],
};

module.exports = {
  Network,
  Devices,
};
