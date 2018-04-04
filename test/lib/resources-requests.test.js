const { getTraces } = require('./utils');
const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const DevtoolsTimelineModel = require('devtools-timeline-model');
const { buildRequests } = require('../../lib/resources-requests');

test('timeline', async () => {
  const traces = await getTraces('../resources/traces.json');
  const resources = buildRequests(new DevtoolsTimelineModel(traces), Number.MAX_VALUE);
  const timeline = S.fromMaybe([], resources);
  expect(timeline).toHaveLength(129);
  const firstTrace = timeline[0];
  const cssTrace = timeline[1];

  expect(firstTrace).toEqual({
    url: 'https://www.despegar.com.ar/search/Hotel/982/2018-04-02/2018-04-04/2',
    startTime: 0,
    duration: 1622,
    priority: 'VeryHigh',
    transferSize: 99124,
    decodedBodyLength: 539334,
    type: 'html',
    status: 200,
    timing: {
      connectStart: 72,
      connectEnd: 534,
      dnsStart: 14,
      dnsEnd: 72,
      proxyStart: -1,
      proxyEnd: -1,
      pushEnd: 0,
      pushStart: 0,
      requestStart: 534,
      requestEnd: 535,
      sslEnd: 534,
      sslStart: 220,
      responseStart: 1103,
    },
  });

  expect(cssTrace).toEqual({
    url: 'https://ar.staticontent.com/hotels/search/public/css/pkg/eva-core.min.ddd45316.css',
    startTime: 1172,
    duration: 256,
    priority: 'VeryHigh',
    transferSize: 3692,
    decodedBodyLength: 13143,
    type: 'stylesheet',
    status: 200,
    timing: {
      connectStart: 18,
      connectEnd: 77,
      dnsStart: 0,
      dnsEnd: 18,
      proxyStart: -1,
      proxyEnd: -1,
      pushEnd: 0,
      pushStart: 0,
      requestStart: 82,
      requestEnd: 83,
      sslEnd: 77,
      sslStart: 31,
      responseStart: 100,
    },
    fromCache: false,
    fromServiceWorker: false,
  });
});
