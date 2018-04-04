const { getTraces } = require('./utils');
const { groupBySource } = require('../../lib/group');

test('group resources by url', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = groupBySource(traces);
  expect(grouped).toHaveLength(75);
  expect(grouped[12].urls).toHaveLength(4);
  expect(grouped[12].urls[0]).toEqual({
    decodedBodyLength: 106878,
    duration: 211,
    mimeType: undefined,
    transferSize: 37166,
    type: 'javascript',
    url: 'https://s0.2mdn.net/879366/dfa7banner_html_inpage_rendering_lib_200_127.js',
  });
});
