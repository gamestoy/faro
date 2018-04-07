const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');
const { eventGrouping } = require('./events');

const build = events => {
  const groupedByUrl = events.bottomUpGroupBy('URL');
  const buildStatsFromUrl = S.pipe([
    filterInvalidUrls,
    addUrlStats,
    filterUrlsWithoutStats
  ]);
  return buildStatsFromUrl(Array.from(groupedByUrl.children));
};

const buildResourceStats = info => {
  const childrenN = !R.isNil(info.children) ? Array.from(info.children.values()) : [];
  return S.reduce(addStat, {}, childrenN);
};

const addStat = obj => {
  return s => {
    S.map(g => {
      obj[g] = S.reduce(S.add, Math.ceil(s.selfTime), S.toMaybe(obj[g]));
      return obj;
    }, S.toMaybe(eventGrouping[s.event.name]));
    return obj;
  };
};

const addUrlStats = events => {
  return S.reduce(
    statsByUrl => ([url, info]) => {
      statsByUrl.push({ url: url, stats: buildResourceStats(info) });
      return statsByUrl;
    },
    [],
    events
  );
};

const filterInvalidUrls = events => {
  return S.filter(e => {
    const url = e[0];
    return url !== 'about:blank' && url !== 'about:srcdoc' && url !== 'native V8Runtime';
  }, events);
};

const filterUrlsWithoutStats = resources => {
  return S.filter(e => S.size(e.stats) > 0, resources);
};

module.exports = {
  buildResourceStats: build,
};
