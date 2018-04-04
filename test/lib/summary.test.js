const { getTraces } = require('./utils');
const { buildSummary } = require('../../lib/summary');

test('create summary', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = buildSummary(traces);
  expect(grouped.all.transferSize).toBe(2437774);
  expect(grouped.all.decodedBodyLength).toBe(6629843);
  expect(grouped.javascript.transferSize).toBe(860270);
  expect(grouped.javascript.decodedBodyLength).toBe(3310242);
  expect(grouped.stylesheet.transferSize).toBe(471446);
  expect(grouped.stylesheet.decodedBodyLength).toBe(1370408);
});
