const fs = require('fs');
const parser = require('../../src/timeline-parser');

const getTraces = () => {
  return new Promise(resolve => {
    fs.readFile('./traces.json', (err, data) => {
      resolve(JSON.parse(data));
    });
  });
};

test('timeline', async () => {
  const traces = await getTraces();
  const timeline = parser.parseTimeline(traces);
  expect(timeline.length).toBe(132);
  const firstTrace = timeline[0];
  expect(firstTrace.url).toBe(
    'https://www.despegar.com.ar/search/Hotel/982/2018-04-02/2018-04-04/2'
  );
  expect(firstTrace.transferSize).toBe(97);
  expect(firstTrace.decodedBodyLength).toBe(527);
  expect(firstTrace.mimeType).toBe('text/html');
  expect(firstTrace.priority).toBe('VeryHigh');
  expect(firstTrace.duration).toBe(706);
});
