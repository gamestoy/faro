const Audit = require('../src/audit');
const argv = require('yargs')
  .usage('Usage: $0 --url=<url> [options]')
  .options({
    url: {
      alias: 'u',
      describe: 'site url',
      demandOption: true,
    },
    path: {
      alias: 'p',
      describe: 'provide a path to file',
    },
    before: {
      alias: 'b',
      describe: 'the metric or mark name used as limit',
    },
    format: {
      alias: 'f',
      describe: 'report format',
      choices: ['tree', 'group', 'list'],
      default: 'list',
    },
    cpu: {
      alias: 'c',
      describe: 'CPU throttling',
      default: 1,
    },
    device: {
      alias: 'd',
      describe: 'Device type',
      choices: ['mobile', 'desktop'],
      default: 'desktop',
    },
    network: {
      alias: 'n',
      describe: 'Network type',
      choices: ['native', 'cable', 'lte', '4g', '3gFast', '3g', '3gSlow', '2g'],
      default: 'native',
    },
  }).argv;

(async () => {
  const url = argv.url;
  const format = argv.format;
  const before = argv.before;
  const path = argv.path ? argv.path : `${process.cwd()}/logs`;
  const cpu = argv.cpu;
  const device = argv.device;
  const network = argv.network;

  const options = {
    format: format,
    before: before,
    path: path,
    cpu: cpu,
    device: device,
    network: network,
  };

  await Audit.execute(url, options);
})();
