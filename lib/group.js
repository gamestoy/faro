const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const stringSimilarity = require('string-similarity');
const Summary = require('./summary');
const url = require('url');

class Group {
  static _getPath(urlStr) {
    const u = url.parse(urlStr);
    return u.hostname + u.pathname;
  }

  static groupByUrl(traces) {
    return S.pipe(
      [S.map(Group._formatTrace), Group._groupByDomain, Group._groupByUrl(0.6), S.join, Group._calculateGroupsSizes],
      traces
    );
  }

  static _calculateGroupsSizes(groups) {
    return S.map(Group._calculateGroupSize, groups);
  }

  static _groupByDomain(traces) {
    return Group._group(traces, Group._compareHostName);
  }

  static _groupByUrl(maximum) {
    return traces => S.map(g => Group._group(g, Group._compareUrl(maximum)), traces);
  }

  static _calculateGroupSize(group) {
    const groupSummary = Summary.create(group);
    return { summary: groupSummary, urls: group };
  }

  static _compareUrl(maximum) {
    return (t1, t2) => stringSimilarity.compareTwoStrings(Group._getPath(t1.url), Group._getPath(t2.url)) >= maximum;
  }

  static _compareHostName(t1, t2) {
    return url.parse(t1.url).hostname === url.parse(t2.url).hostname;
  }

  static _formatTrace(trace) {
    return {
      url: trace.url,
      duration: trace.duration,
      type: trace.type,
      transferSize: trace.transferSize,
      decodedBodyLength: trace.decodedBodyLength,
      mimeType: trace.mimeType,
    };
  }

  static _group(traces, f) {
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
  }
}

module.exports = Group;
