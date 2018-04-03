const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const Chrome = require('./chrome');
const { buildRequests } = require('./resources-requests');
const { buildV8RuntimeStats } = require('./runtime-stats');
const { generateReport } = require('./file-report');
const { buildResourceStats } = require('./resources-stats');
const { buildMainThreadStats } = require('./main-thread-stats');
const { buildTree } = require('./tree');
const { groupBySource } = require('./group');
const { buildSummary } = require('./summary');

class Audit {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }
  _getBefore(data) {
    const metric = S.find(m => m.name === this.options.before && m.value, data.metrics);
    return S.maybe(Number.MAX_VALUE, m => m.value, metric);
  }

  _mergeResourcesInfo(resourcesRequests, resourcesStats) {
    const statsMap = S.reduce(rsMap => rs => rsMap.set(rs.url, rs.stats), new Map(), resourcesStats);
    return S.map(r => {
      r.stats = statsMap.get(r.url);
      return r;
    }, resourcesRequests);
  }

  _analyze() {
    return d => {
      const before = this._getBefore(d);
      console.info('Analyzing requests...');
      const resources = this._collectResourcesInfo(d, before);
      console.info('Analyzing main thread stats...');
      const mainThreadStats = buildMainThreadStats(d.traces);
      console.info('Analyzing V8 stats...');
      const runtime = buildV8RuntimeStats(d.traces, before);
      console.info('Creating resource tree...');
      const tree = buildTree(resources);
      console.info('Grouping by source...');
      const group = groupBySource(resources);
      const summary = buildSummary(resources);
      return {
        resources: resources,
        marks: d.metrics,
        tree: tree,
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
    return S.join(S.map(d => S.encase(this._analyze(), d), data));
  }

  _collectResourcesInfo(data, before) {
    const resourcesRequests = buildRequests(data.traces, before);
    const resources = S.map(rr => {
      const resourcesStats = buildResourceStats(data.traces);
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
