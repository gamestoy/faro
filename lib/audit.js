const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const Chrome = require('./chrome');
const ResourcesRequests = require('./resources-requests');
const V8RuntimeStats = require('./runtime-stats');
const FileReporter = require('./file-reporter');
const ResourcesStats = require('./resources-stats');
const MainThreadStats = require('./main-thread-stats');
const Tree = require('./tree');
const Group = require('./group');
const Summary = require('./summary');

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

  static _analyze(options) {
    return d => {
      const before = Audit._getBefore(d, options);
      console.info('Analyzing requests...');
      const resourcesRequests = ResourcesRequests.parse(d.traces, before);
      const resources = Audit._getResources(d, resourcesRequests);
      console.info('Analyzing main thread stats...');
      const mainThreadStats = MainThreadStats.create(d.traces);
      console.info('Analyzing V8 stats...');
      const runtime = V8RuntimeStats.create(d.traces, before);
      console.info('Creating resource tree...');
      const tree = Tree.create(resources);
      console.info('Grouping by url...');
      const group = Group.groupByUrl(resources);
      const summary = Summary.create(resources);
      return {
        resources: resources,
        marks: d.metrics,
        tree: tree,
        grouped_by_url: group,
        main_thread_stats: mainThreadStats,
        v8_runtime_stats: runtime,
        summary: summary,
      };
    };
  }

  static async _run(url, options) {
    console.info('Collecting metrics from ' + url);
    const chrome = new Chrome(url, options);
    const data = await chrome.getEvents();
    return S.join(S.map(d => S.encase(Audit._analyze(options), d), data));
  }

  static _getResources(data, resourcesRequests) {
    const resources = S.map(rr => {
      const resourcesStats = ResourcesStats.create(data.traces);
      return Audit._mergeResourcesInfo(rr, resourcesStats);
    }, resourcesRequests);
    return S.fromMaybe([], resources);
  }

  static async execute(url, options) {
    const metrics = await Audit._run(url, options);
    if (S.isJust(metrics)) {
      S.map(m => {
        const filename = FileReporter.generate(options.path, m);
        console.info('Saving report to ' + filename);
      }, metrics);
    } else {
      console.error('There was an error collecting metrics from ' + url);
      process.exit(-1);
    }
  }
}

module.exports = Audit;
