const { getTraces } = require('./utils');
const { groupBySource } = require('../../lib/group');

test('group resources by url', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = groupBySource(traces);
  expect(grouped).toHaveLength(36);
  expect(grouped[12].urls).toHaveLength(4);
  expect(grouped[12].urls[0]).toEqual({
    url: 'https://ddp.trackeame.com/ddp/cm/match.js?&rn=721922',
    duration: 937,
    type: 'javascript',
    transferSize: 1741,
    decodedBodyLength: 1425,
  });
});
