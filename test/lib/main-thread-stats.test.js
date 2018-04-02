const { getTraces } = require('./utils');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const { buildMainThreadStats } = require('../../lib/main-thread-stats');

test('main thread stats', async () => {
  const traces = await getTraces('../resources/traces.json');
  const stats = buildMainThreadStats(new DevtoolsTimelineModel(traces));
  expect(stats).toHaveLength(18);
  expect(stats[0]).toEqual({ name: 'Recalculate Style', duration: 4173 });
  expect(stats[4]).toEqual({ name: 'Evaluate Script', duration: 1652 });
});
