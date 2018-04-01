const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const Chrome = require('./chrome');
const ResourcesRequests = require('./resources-requests');
const V8RuntimeStats = require('./runtime-stats');
const FileReporter = require('./file-reporter');
const ResourcesStats = require('./resources-stats');
const Tree = require('./tree');

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
    return S.map(d => {
      const before = Audit._getBefore(d, options);
      const resourcesRequests = ResourcesRequests.parse(d.traces, before);
      const resources = Audit._getResources(d, resourcesRequests);
      const runtime = V8RuntimeStats.parse(d.traces, before);
      const tree = Tree.create(resources);
      return {
        resources: resources,
        performance: d.metrics,
        v8_runtime_stats: runtime,
        tree: tree,
      };
    }, data);
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
    S.map(m => FileReporter.generate(options.path, m), metrics);
  }
}

module.exports = Audit;
