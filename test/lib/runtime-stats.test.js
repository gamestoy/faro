const { getTraces } = require('./utils');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const V8RuntimeStats = require('../../lib/runtime-stats');

test('runtime traces', async () => {
  const traces = await getTraces('../resources/traces.json');
  const runtime = V8RuntimeStats.parse(new DevtoolsTimelineModel(traces), Number.MAX_VALUE);
  expect(runtime.parse).toBe(787);
  expect(runtime.compile).toBe(956);
  expect(runtime.backgroundParse).toBe(63);
});
