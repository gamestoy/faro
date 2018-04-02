const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');

class Summary {
  static create(traces) {
    const all = Summary._calculateResourcesSize(traces);
    const sizesByType = Summary._calculateSizeByResourceType(traces);
    return Object.assign(all, sizesByType);
  }

  static _calculateSizeByResourceType(traces) {
    return S.pipe(
      [
        S.filter(Summary._isValid),
        R.groupBy(t => t.type),
        S.map(g => {
          return S.reduce(Summary._calculate, { transferSize: 0, decodedBodyLength: 0 }, g);
        }),
      ],
      traces
    );
  }

  static _isValid(trace) {
    return !R.isNil(trace.transferSize) || !R.isNil(trace.decodedBodyLength);
  }

  static _calculateResourcesSize(traces) {
    const summary = S.reduce(Summary._calculate, { transferSize: 0, decodedBodyLength: 0 }, traces);
    return { all: summary };
  }

  static _calculate(acc) {
    return t => {
      const tTransferSize = t.transferSize ? t.transferSize : 0;
      const tDecodedBodyLength = t.decodedBodyLength ? t.decodedBodyLength : 0;
      return {
        transferSize: acc.transferSize + tTransferSize,
        decodedBodyLength: acc.decodedBodyLength + tDecodedBodyLength,
      };
    };
  }
}

module.exports = Summary;
