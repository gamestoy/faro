const stringSimilarity = require('string-similarity');

const getPath = url => {
  const lastIdx = url.lastIndexOf('/');
  return url.substring(0, lastIdx);
};

const group = (traces, maximum) => {
  const _source = traces.slice();
  const matches = [];
  for (let x = _source.length - 1; x >= 0; x--) {
    const output = _source.splice(x, 1);
    for (let y = _source.length - 1; y >= 0; y--) {
      if (stringSimilarity.compareTwoStrings(getPath(output[0].url), getPath(_source[y].url)) >= maximum) {
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
  groupUrls: group,
};
