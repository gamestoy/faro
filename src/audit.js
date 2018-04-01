const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const Chrome = require('./chrome');
const ResourcesRequests = require('./resources-requests');
const V8RuntimeStats = require('./runtime-stats');
const FileReporter = require('./file-reporter');
const ResourcesStats = require('./resources-stats');

class Audit {
  static _getBefore(data, options) {
    const metric = S.find(m => m.name === options.before && m.value, data.metrics);
    return S.maybe(Number.MAX_VALUE, m => m.value, metric);
  }

  static _mergeResourcesInfo(resourcesRequests, resourcesStats) {
    const statsMap = S.reduce(rsMap => rs => rsMap.set(rs.url, rs.stats), new Map(), resourcesStats);
    return S.map(r => {
      r.stats = statsMap.get(r.url);
      return r;
    }, resourcesRequests);
  }

  static async _run(url, options) {
    const chrome = new Chrome(url, options);
    const data = await chrome.getEvents();
    const before = Audit._getBefore(data, options);
    const resourcesRequests = ResourcesRequests.parse(data.traces, before);
    const resources = Audit._getResources(data, resourcesRequests);
    const runtime = V8RuntimeStats.parse(data.traces, before);
    return {
      resources: resources,
      performance: data.metrics,
      v8_runtime_stats: runtime,
    };
  }

  static _getResources(data, resourcesRequests) {
    const resources = S.map(rr => {
      const resourcesStats = ResourcesStats.parse(data.traces);
      return Audit._mergeResourcesInfo(rr, resourcesStats);
    }, resourcesRequests);
    return S.fromMaybe([], resources);
  }

  static async execute(url, options) {
    const metrics = await Audit._run(url, options);
    FileReporter.generate(options.path, metrics);
  }
}

module.exports = Audit;
