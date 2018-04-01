const { getTraces } = require('./utils');
const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const DevtoolsTimelineModel = require('devtools-timeline-model');
const ResourcesRequests = require('../../lib/resources-requests');

test('timeline', async () => {
  const traces = await getTraces('../resources/traces.json');
  const resources = ResourcesRequests.parse(new DevtoolsTimelineModel(traces), Number.MAX_VALUE);
  const timeline = S.fromMaybe([], resources);
  expect(timeline.length).toBe(132);
  const firstTrace = timeline[0];
  expect(firstTrace.url).toBe('https://www.despegar.com.ar/search/Hotel/982/2018-04-02/2018-04-04/2');
  expect(firstTrace.transferSize).toBe(99124);
  expect(firstTrace.decodedBodyLength).toBe(539334);
  expect(firstTrace.mimeType).toBe('text/html');
  expect(firstTrace.priority).toBe('VeryHigh');
  expect(firstTrace.duration).toBe(1622);
});