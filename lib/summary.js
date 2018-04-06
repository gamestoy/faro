const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');

const build = traces => {
  const all = calculateResourcesSize(traces);
  const sizesByType = calculateSizeByResourceType(traces);
  return Object.assign(all, sizesByType);
};

const calculateSizeByResourceType = traces => {
  return S.pipe(
    [
      S.filter(isValid),
      R.groupBy(t => t.type),
      S.map(g => {
        return S.reduce(calculate, { transferSize: 0, decodedBodyLength: 0 }, g);
      }),
    ],
    traces
  );
};

const isValid = trace => {
  return !R.isNil(trace.transferSize) || !R.isNil(trace.decodedBodyLength);
};

const calculateResourcesSize = traces => {
  const summary = S.reduce(calculate, { transferSize: 0, decodedBodyLength: 0 }, traces);
  return { all: summary };
};

const calculate = acc => t => {
    const tTransferSize = t.transferSize ? t.transferSize : 0;
    const tDecodedBodyLength = t.decodedBodyLength ? t.decodedBodyLength : 0;
    return {
      transferSize: acc.transferSize + tTransferSize,
      decodedBodyLength: acc.decodedBodyLength + tDecodedBodyLength,
    };
};

module.exports = {
  buildSummary: build,
};
