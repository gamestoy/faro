const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const stringSimilarity = require('string-similarity');
const { buildSummary } = require('./summary');
const url = require('url');

const getPath = urlStr => {
  const u = url.parse(urlStr);
  return u.hostname + u.pathname;
};

const groupBySource = traces => {
  return S.pipe([S.map(formatTrace), groupByDomain, groupByUrl(0.6), S.join, calculateGroupsSizes], traces);
};

const calculateGroupsSizes = groups => {
  return S.map(calculateGroupSize, groups);
};

const groupByDomain = traces => {
  return group(traces, compareHostName);
};

const groupByUrl = maximum => {
  return traces => S.map(g => group(g, compareUrl(maximum)), traces);
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
    decodedBodyLength: trace.decodedBodyLength,
    mimeType: trace.mimeType,
  };
};

const group = (traces, f) => {
  const _source = traces.slice();
  const matches = [];
  for (let x = _source.length - 1; x >= 0; x--) {
    const output = _source.splice(x, 1);
    for (let y = _source.length - 1; y >= 0; y--) {
      if (f(output[0], _source[y])) {
        output.push(_source[y]);
        _source.splice(y, 1);
        x--;
      }
    }
    matches.push(output);
  }
  return matches;
};

module.exports = {
  groupBySource,
};
