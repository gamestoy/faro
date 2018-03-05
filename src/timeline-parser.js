const R = require('ramda');
const { TIMELINE_TRACE_TYPE, TRACE_CATEGORY } = require('./traces');

function isRequestStart(trace) {
  return trace.name === TIMELINE_TRACE_TYPE.RequestStart && !R.isNil(trace.args.data.url);
}

function isResponseStart(trace) {
  return trace.name === TIMELINE_TRACE_TYPE.ResponseStart;
}

function isResponseComplete(trace) {
  return trace.name === TIMELINE_TRACE_TYPE.ResponseComplete;
}

function isValidTrace(trace, before, initTime) {
  return trace.cat === TRACE_CATEGORY.Timeline &&
    !R.isNil(trace.args.data) &&
    (isRequestStart(trace) || isResponseStart(trace) || isResponseComplete(trace))
    && formatDuration(trace.ts, initTime) <= before;
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
    mimeType: response.args.data.mimeType
  };
}

function findNavigationStart(data) {
  return data.traceEvents
    .find(t => t.cat === "blink.user_timing" && t.name === "navigationStart");
}

function parse(data, before) {
  const initTime = findNavigationStart(data).ts;
  const traces = data.traceEvents.filter(t => isValidTrace(t, before, initTime));
  const url = traces[0].args.data.url;
  const convert = R.pipe(
    R.groupBy(t => t.args.data.requestId),
    R.filter(t => t.length > 1),
    R.map(t => mergeTraces(t, url, initTime))
  );
  return Object.values(convert(traces));
}

module.exports = {
  parseTimeline: parse
};
