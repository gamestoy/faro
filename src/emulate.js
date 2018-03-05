const devices = require('puppeteer/DeviceDescriptors');

const LATENCY_FACTOR = 3.75;
const THROUGHPUT_FACTOR = 0.9;

const TARGET_LATENCY = 150; // 150ms
const TARGET_DOWNLOAD_THROUGHPUT = Math.floor(1.6 * 1024 * 1024 / 8); // 1.6Mbps
const TARGET_UPLOAD_THROUGHPUT = Math.floor(750 * 1024 / 8); // 750Kbps

const TYPICAL_MOBILE_THROTTLING_METRICS = {
  targetLatency: TARGET_LATENCY,
  latency: TARGET_LATENCY * LATENCY_FACTOR,
  targetDownloadThroughput: TARGET_DOWNLOAD_THROUGHPUT,
  downloadThroughput: TARGET_DOWNLOAD_THROUGHPUT * THROUGHPUT_FACTOR,
  targetUploadThroughput: TARGET_UPLOAD_THROUGHPUT,
  uploadThroughput: TARGET_UPLOAD_THROUGHPUT * THROUGHPUT_FACTOR,
  offline: false
};

const TYPICAL_MOBILE_CPU_THROTTLING = 4;

const NO_THROTTLING_METRICS = {
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
  offline: false
};

const DEVICES = {
  desktop: {
    viewport: {
      width: 1366,
      height: 768
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  },
  mobile: devices['Nexus 6']
};

const NETWORK = {
  mobile: TYPICAL_MOBILE_THROTTLING_METRICS,
  desktop: NO_THROTTLING_METRICS
};

module.exports = {
  NETWORK,
  DEVICES
};
