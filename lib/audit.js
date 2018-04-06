const R = require('ramda');
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
      const mainResults = this._buildOnLoadCompleteResults(model, data.metrics);
      const markResults = this._shouldAnalyzeLimitedModel() ? this._buildMarkResults(mainResults.on_load.resources, data.metrics)  : {};

      return R.isEmpty(markResults) ? mainResults.on_load : Object.assign(mainResults, markResults);
    };
  }

  _shouldAnalyzeLimitedModel() {
    return !R.isNil(this.options.mark);
  }

  _buildOnLoadCompleteResults(model, metrics) {
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
      on_load: {
        resources: resources,
        marks: metrics,
        grouped_by_source: group,
        main_thread_stats: mainThreadStats,
        v8_runtime_stats: runtime,
        summary: summary,
      }
    };
  }

  _buildMarkResults(resources, metrics) {
    const mark = this._getMarkTime(metrics, this.options.mark);
    return S.reduce(results => mk => {
      console.info(`Analyzing performance before ${this.options.mark} ...`);
      const resourcesBeforeMark = S.filter(r => r.startTime + r.duration <= mk, resources);
      const summary = buildSummary(resourcesBeforeMark);
      results[this.options.mark] = {
        resources: resourcesBeforeMark,
        summary: summary,
      };
      return results;
    }, {}, mark);
  }

  _getMarkTime(metrics, mark) {
    return S.map(m => m.value,
      S.find(m => m.name === mark && m.value, metrics));
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
