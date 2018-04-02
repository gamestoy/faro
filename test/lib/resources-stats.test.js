const { getTraces } = require('./utils');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const { buildResourceStats } = require('../../lib/resources-stats');

test('urls stats', async () => {
  const traces = await getTraces('../resources/traces.json');
  const stats = buildResourceStats(new DevtoolsTimelineModel(traces));
  expect(stats).toHaveLength(55);
  expect(stats[0].url).toBe('https://www.despegar.com.ar/search/Hotel/982/2018-04-02/2018-04-04/2');
  expect(stats[0].stats).toEqual({
    script_evaluation: 2517,
    script_parse_compile: 95,
  });
});
