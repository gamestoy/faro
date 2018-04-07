const { getTraces } = require('./utils');
const { groupBySource } = require('../../lib/group');

test('group resources by url', async () => {
  const traces = await getTraces('../resources/resources.json');
  const grouped = groupBySource(traces);
  expect(grouped).toHaveLength(75);
  expect(grouped[0].urls).toHaveLength(8);
  expect(grouped[0].summary).toEqual({
    "all":
      {"resources": 8, "decodedBodyLength": 624742, "transferSize": 354176},
    "image": {"resources": 5, "decodedBodyLength": 10454, "transferSize": 13984},
    "javascript": {"resources": 1, "decodedBodyLength": 75436, "transferSize": 14332},
    "stylesheet": {"resources": 2, "decodedBodyLength": 538852, "transferSize": 325860}});
  expect(grouped[0].urls[0]).toEqual({
    decodedBodyLength: 514127,
    duration: 268,
    transferSize: 319961,
    type: 'stylesheet',
    url: 'https://www.staticontent.com/lresources/css-versioned/2.1.27/pkg/login-popup.css',
  });
});
