const R = require("ramda");
const { TraceType, TraceCategory } = require("./constants");

function isValidTrace(trace) {
  return (
    trace.cat === TraceCategory.Timeline &&
    typeof trace.args.data !== "undefined" &&
    ((trace.name === TraceType.RequestStart && typeof trace.args.data.url !== "undefined") ||
      trace.name === TraceType.ResponseStart ||
      trace.name === TraceType.ResponseComplete)
  );
}

function getInitiator(trace, url) {
  if (trace.args.data.stackTrace && trace.args.data.stackTrace[0].url !== url) {
    return trace.args.data.stackTrace[0].url;
  }
}

function mergeTraces(traces, url, initTime) {
  const start = traces[0];
  const response = traces[1];
  const finish = traces[traces.length - 1];
  return convertTrace(start, response, finish, url, initTime);
}

function formatSize(size) {
  return Math.ceil(size / 1024);
}

function formatDuration(n, initTime) {
  return Math.ceil((n - initTime) / 1000);
}

function convertTrace(start, response, finish, url, initTime) {
  return {
    id: start.args.data.requestId,
    url: start.args.data.url,
    init: formatDuration(start.ts, initTime),
    duration: formatDuration(finish.ts, start.ts),
    priority: start.args.data.priority,
    transferSize: formatSize(finish.args.data.encodedDataLength),
    decodedBodyLength: formatSize(finish.args.data.decodedBodyLength),
    initiator: getInitiator(start, url),
    mimeType: response.args.data.mimeType,
  };
}

function parse(data) {
  const traces = data.traceEvents.filter(t => isValidTrace(t));
  const initTime = traces[0].ts;
  const url = traces[0].args.data.url;
  const convert = R.pipe(
    R.groupBy(t => t.args.data.requestId),
    R.filter(t => t.length > 1),
    R.map(t => mergeTraces(t, url, initTime))
  );
  return Object.values(convert(traces));
}

module.exports = {
  parseTraces: parse,
};
