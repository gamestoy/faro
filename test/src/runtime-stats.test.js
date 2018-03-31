const fs = require('fs');
const DevtoolsTimelineModel = require('devtools-timeline-model');
const V8RuntimeStats = require('../../src/runtime-stats');

const getTraces = () => {
  return new Promise(resolve => {
    fs.readFile('../resources/traces.json', (err, data) => {
      resolve(JSON.parse(data));
    });
  });
};

test('runtime traces', async () => {
  const traces = await getTraces();
  const runtime = V8RuntimeStats.parse(new DevtoolsTimelineModel(traces), Number.MAX_VALUE);
  expect(runtime.parse).toBe(787);
  expect(runtime.compile).toBe(956);
  expect(runtime.backgroundParse).toBe(63);
});
