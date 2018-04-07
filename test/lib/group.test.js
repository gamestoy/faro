const { getTraces } = require('./utils');
const { groupBySource } = require('../../lib/group');

test('group resources by url', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = groupBySource(traces);
  expect(grouped).toHaveLength(75);
  expect(grouped[0].urls).toHaveLength(8);
  expect(grouped[0].urls[0]).toEqual({
    decodedBodyLength: 514127,
    duration: 268,
    transferSize: 319961,
    type: 'stylesheet',
    url: 'https://www.staticontent.com/lresources/css-versioned/2.1.27/pkg/login-popup.css',
  });
});
