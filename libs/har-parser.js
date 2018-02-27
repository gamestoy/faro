const R = require("ramda");

function getInitiator(trace, url) {
  if (trace._initiator && trace._initiator.type === "script" && trace._initiator.stack.callFrames[0].url !== url) {
    return trace._initiator.stack.callFrames[0].url;
  }
}

function getContentType(trace) {
  const headers = trace.response.headers.filter(h => h.name === "Content-Type");
  return R.isEmpty(headers) ? "Unknown" : headers[0].value;
}

function formatSize(size) {
  return Math.ceil(size / 1024);
}

function convertTrace(trace, url) {
  return {
    url: trace.request.url,
    duration: Math.ceil(trace.time),
    priority: trace._priority,
    transferSize: formatSize(trace.response._transferSize),
    size: formatSize(trace.response.content.size),
    initiator: getInitiator(trace, url),
    contentType: getContentType(trace),
  };
}

function parse(har, url) {
  return har.map(t => convertTrace(t, url));
}

module.exports = {
  parseHAR: parse,
};
