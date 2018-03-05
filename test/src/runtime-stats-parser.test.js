const fs = require('fs');
const parser = require('../../src/runtime-stats-parser');

const getTraces = () => {
  return new Promise(resolve => {
    fs.readFile('./traces.json', (err, data) => {
      resolve(JSON.parse(data));
    });
  });
};

test('runtime traces', async () => {
  const traces = await getTraces();
  const runtime = parser.parseRuntimeStats(traces);
  expect(runtime.backgroundParse).toBe(63);
  expect(runtime.parse).toBe(787);
  expect(runtime.compile).toBe(956);
});
