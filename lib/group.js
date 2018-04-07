const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');
const stringSimilarity = require('string-similarity');
const { buildSummary } = require('./summary');
const url = require('url');

const getPath = urlStr => {
  const u = url.parse(urlStr);
  return u.hostname + u.pathname;
};

const groupBySource = traces => {
  return S.pipe([S.map(formatTrace), groupByDomain, groupByUrl(0.6), S.join, calculateGroupsSizes, sortBySize], traces);
};

const calculateGroupsSizes = groups => {
  return S.map(calculateGroupSize, groups);
};

const sortBySize = groups => {
  return S.sortBy(v => -1 * S.props(['summary', 'all', 'transferSize'], v), groups);
};

const groupByDomain = traces => {
  return group([], traces, compareHostName);
};

const groupByUrl = maximum => {
  return traces => S.map(g => group([], g, compareUrl(maximum)), traces);
};

const calculateGroupSize = group => {
  const groupSummary = buildSummary(group);
  return { summary: groupSummary, urls: group };
};

const compareUrl = maximum => {
  return (t1, t2) => stringSimilarity.compareTwoStrings(getPath(t1.url), getPath(t2.url)) >= maximum;
};

const compareHostName = (t1, t2) => {
  return url.parse(t1.url).hostname === url.parse(t2.url).hostname;
};

const formatTrace = trace => {
  return {
    url: trace.url,
    duration: trace.duration,
    type: trace.type,
    transferSize: trace.transferSize,
    decodedBodyLength: trace.decodedBodyLength
  };
};

const group = (groups, l, f) => {
  return S.reduce(acc => h => {
    return S.reduce(g => tail => {
      const xs = R.partition(v => f(h, v), tail);
      const matches = g.concat(xs[0]);
      return group(S.append(matches, acc), xs[1], f);
    }, [h], S.tail(l));
  }, groups, S.head(l));
};

module.exports = {
  groupBySource,
};
