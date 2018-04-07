const { getTraces } = require('./utils');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const { buildMainThreadStats } = require('../../lib/main-thread-stats');

test('main thread stats', async () => {
  const traces = await getTraces('../resources/traces.json');
  const stats = buildMainThreadStats(new DevtoolsTimelineModel(traces));
  expect(stats.event).toHaveLength(18);
  expect(stats.event[0]).toEqual({ name: 'Recalculate Style', duration: 4173 });
  expect(stats.event[4]).toEqual({ name: 'Evaluate Script', duration: 1652 });
  expect(stats.category).toEqual([
    {
      "name": "rendering",
      "duration": 8040
    },
    {
      "name": "scripting",
      "duration": 7429
    },
    {
      "name": "loading",
      "duration": 635
    },
    {
      "name": "painting",
      "duration": 398
    }
  ]);
});
