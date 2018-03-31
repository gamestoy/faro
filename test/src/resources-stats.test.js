const fs = require('fs');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const ResourcesStats = require('../../src/resources-stats');

const getTraces = () => {
  return new Promise(resolve => {
    fs.readFile('../resources/traces.json', (err, data) => {
      resolve(JSON.parse(data));
    });
  });
};

test('urls stats', async () => {
  const traces = await getTraces();
  const stats = ResourcesStats.parse(new DevtoolsTimelineModel(traces));
  expect(stats).toHaveLength(55);
  expect(stats[0].url).toBe('https://www.despegar.com.ar/search/Hotel/982/2018-04-02/2018-04-04/2');
  expect(stats[0].stats).toEqual({
    script_evaluation: 2516.1949998885393,
    script_parse_compile: 94.32799999415874,
  });
});
