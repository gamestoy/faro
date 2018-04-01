const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');
const { eventGrouping } = require('./events');

class ResourcesStats {
  static parse(events) {
    const groupedByUrl = events.bottomUpGroupBy('URL');
    const buildStatsFromUrl = S.pipe([
      ResourcesStats._filterInvalidUrls,
      ResourcesStats._addUrlStats,
      ResourcesStats._filterUrlsWithoutStats,
    ]);
    return buildStatsFromUrl(Array.from(groupedByUrl.children));
  }

  static _buildResourceStats(info) {
    const childrenN = !R.isNil(info.children) ? Array.from(info.children.values()) : [];
    return S.reduce(ResourcesStats._addStat, {}, childrenN);
  }

  static _addStat(obj) {
    return s => {
      S.map(g => {
        obj[g] = S.reduce(S.add, s.selfTime, S.toMaybe(obj[g]));
        return obj;
      }, S.toMaybe(eventGrouping[s.event.name]));
      return obj;
    };
  }

  static _addUrlStats(events) {
    return S.reduce(
      statsByUrl => ([url, info]) => {
        statsByUrl.push({ url: url, stats: ResourcesStats._buildResourceStats(info) });
        return statsByUrl;
      },
      [],
      events
    );
  }

  static _filterInvalidUrls(events) {
    return S.filter(e => {
      const url = e[0];
      return url !== 'about:blank' && url !== 'about:srcdoc' && url !== 'native V8Runtime';
    }, events);
  }

  static _filterUrlsWithoutStats(resources) {
    return S.filter(e => S.size(e.stats) > 0, resources);
  }
}

module.exports = ResourcesStats;
