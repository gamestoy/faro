const { getTraces } = require('./utils');
const Summary = require('../../lib/summary');

test('create summary', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = Summary.create(traces);
  expect(grouped.all.transferSize).toBe(1336525);
  expect(grouped.all.decodedBodyLength).toBe(3973711);
  expect(grouped.javascript.transferSize).toBe(477640);
  expect(grouped.javascript.decodedBodyLength).toBe(1569540);
  expect(grouped.stylesheet.transferSize).toBe(471446);
  expect(grouped.stylesheet.decodedBodyLength).toBe(1370408);
});
