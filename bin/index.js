const { execute } = require('../src/metrics');
const argv = require('yargs')
  .usage('Usage: $0 --url=<url> [options]')
  .options({
    url: {
      alias: 'u',
      describe: 'site url',
      demandOption: true
    },
    path: {
      alias: 'p',
      describe: 'provide a path to file'
    },
    before: {
      alias: 'b',
      describe: 'the metric or mark name used as limit'
    },
    format: {
      alias: 'f',
      describe: 'report format',
      choices: ['tree', 'group', 'list']
    },
    cpu: {
      alias: 'c',
      describe: 'CPU throttling'
    },
    device: {
      alias: 'd',
      describe: 'Device type',
      choices: ['mobile', 'desktop']
    },
    network: {
      alias: 'n',
      describe: 'Network type',
      choices: ['mobile', 'desktop']
    }
  }).argv;

(async () => {
  const url = argv.url;
  const format = argv.format;
  const before = argv.before;
  const path = argv.path ? argv.path : `${process.cwd()}/logs`;
  const cpu = argv.cpu ? argv.cpu : 1;
  const device = argv.device ? argv.device : 'desktop';
  const network = argv.network ? argv.network : 'desktop';

  const options = {
    format: format,
    before: before,
    path: path,
    cpu: cpu,
    device: device,
    network: network
  };

  await execute(url, options);
})();
