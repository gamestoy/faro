const Audit = require('../lib/audit');
const argv = require('yargs')
  .usage('Usage: $0 <url> [options]')
  .options({
    path: {
      alias: 'p',
      describe: 'provide a path to file',
    },
    mark: {
      alias: 'm',
      describe: 'the metric or mark used as limit',
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
    header: {
      alias: 'h',
      describe: 'HTTP header',
    },
  }).argv;

const url = argv._[0];
const mark = argv.mark;
const path = argv.path ? argv.path : `${process.cwd()}/logs`;
const cpu = argv.cpu;
const device = argv.device;
const network = argv.network;
const headers = argv.header && !Array.isArray(argv.header) ? [argv.header] : argv.header;

const options = {
  mark: mark,
  path: path,
  cpu: cpu,
  device: device,
  network: network,
  headers,
};

new Audit(url, options)
  .start()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
