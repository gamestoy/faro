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

  _mergeResourcesInfo(resourcesRequests, resourcesStats) {
    const statsMap = S.reduce(rsMap => rs => rsMap.set(rs.url, rs.stats), new Map(), resourcesStats);
    return S.map(r => {
      r.stats = statsMap.get(r.url);
      return r;
    }, resourcesRequests);
  }

  _analyze() {
    return data => {
      const model = new DevtoolsTimelineModel(data.traces);
      console.info('Analyzing requests...');
      const resources = this._collectResourcesInfo(model);
      console.info('Analyzing main thread stats...');
      const mainThreadStats = buildMainThreadStats(model);
      console.info('Analyzing V8 stats...');
      const runtime = buildV8RuntimeStats(model);
      console.info('Grouping by source...');
      const group = groupBySource(resources);
      const summary = buildSummary(resources);
      return {
        resources: resources,
        marks: data.metrics,
        grouped_by_source: group,
        main_thread_stats: mainThreadStats,
        v8_runtime_stats: runtime,
        summary: summary,
      };
    };
  }

  async _run() {
    console.info('Collecting metrics from ' + this.url);
    const chrome = new Chrome(this.url, this.options);
    const data = await chrome.getEvents();
    return S.chain(d => S.encase(this._analyze(), d), data);
  }

  _collectResourcesInfo(model) {
    const resourcesRequests = buildRequests(model);
    const resources = S.map(rr => {
      const resourcesStats = buildResourceStats(model);
      return this._mergeResourcesInfo(rr, resourcesStats);
    }, resourcesRequests);
    return S.fromMaybe([], resources);
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
