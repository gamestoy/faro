const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const DevtoolsTimelineModel = require('devtools-timeline-model');
const Chrome = require('./chrome');
const { buildRequests } = require('./resources-requests');
const { buildV8RuntimeStats } = require('./runtime-stats');
const { generateReport } = require('./file-report');
const { buildResourceStats } = require('./resources-stats');
const { buildMainThreadStats } = require('./main-thread-stats');
const { groupBySource } = require('./group');
const { buildSummary } = require('./summary');

class Audit {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }

  _analyze() {
    return data => {
      const model = new DevtoolsTimelineModel(data.traces);
      console.info('Analyzing requests...');
      const resourcesRequests = buildRequests(model);
      return S.map(r => {
        console.info('Analyzing js resources...');
        const jsResourcesStats = buildResourceStats(model);
        console.info('Analyzing main thread stats...');
        const mainThreadStats = buildMainThreadStats(model);
        console.info('Analyzing V8 stats...');
        const runtime = buildV8RuntimeStats(model);
        console.info('Grouping by source...');
        const group = groupBySource(r);
        const summary = buildSummary(r);
        return {
          resources: r,
          js_resources_stats: jsResourcesStats,
          marks: data.metrics,
          coverage: data.coverage,
          grouped_by_source: group,
          main_thread_stats: mainThreadStats,
          v8_runtime_stats: runtime,
          summary: summary,
        };
      }, resourcesRequests);
    };
  }

  async _run() {
    console.info('Collecting metrics from ' + this.url);
    const chrome = new Chrome(this.url, this.options);
    const data = await chrome.getEvents();
    return S.chain(d => S.join(S.encase(this._analyze(), d)), data);
  }

  async start() {
    const metrics = await this._run();
    if (S.isJust(metrics)) {
      S.map(m => {
        const filename = generateReport(this.options.path, m, this.url);
        console.info('Saving report to ' + filename);
      }, metrics);
    } else {
      throw 'There was an error collecting metrics from ' + this.url;
    }
  }
}

module.exports = Audit;
