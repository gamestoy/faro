const R = require('ramda');
const { getData } = require('./chrome');
const { parseTimeline } = require('./timeline-parser');
const { parseRuntimeStats } = require('./runtime-stats-parser');
const { createTree } = require('./tree');
const { generateFile } = require('./report');

function getBefore(data, options) {
  const metric = data.metrics.find(m => m.name === options.before);
  return R.isNil(metric) ? Number.MAX_VALUE : metric.value;
}

async function getMetrics(url, options) {
  const data = await getData(url, options);
  const before = getBefore(data, options);
  const resources = await parseTimeline(data.traces, before);
  const runtime = parseRuntimeStats(data.traces, before);
  return { resources: resources, performance: data.metrics, runtime: runtime };
}

async function execute(url, options) {
  const metrics = await getMetrics(url, options);

  generateFile(options.path, metrics);

  if (options.format === 'tree') {
    metrics.resources = createTree(metrics.resources);
  }
  console.info(JSON.stringify(metrics, null, '\t'));
}

module.exports = {
  execute
};
