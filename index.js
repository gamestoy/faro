const argv = require("yargs")
  .usage("Usage: $0 --url=<url> [options]")
  .options({
    url: {
      alias: "u",
      describe: "site url",
      demandOption: true,
    },
    path: {
      alias: "p",
      describe: "provide a path to file",
    },
    before: {
      alias: "b",
      describe: "the metric or mark name used as limit",
    },
    format: {
      alias: "f",
      describe: "report format",
      choices: ["tree", "group", "list"],
    },
  }).argv;

const { getTraces } = require("./libs/traces");
const { parseTraces } = require("./libs/traces-parser");
const { createTree } = require("./libs/tree");
const { generateFile } = require("./libs/report");

async function getMetrics(url, before) {
  const data = await getTraces(url);
  const resources = await parseTraces(data.traces);
  return { performance: data.metrics, resources: resources };
}

(async () => {
  const url = argv.url;
  const format = argv.format;
  const before = argv.before;
  const path = argv.path ? argv.path : `${__dirname}/logs`;

  const metrics = await getMetrics(url, before);

  generateFile(path, metrics);

  if (format === "tree") {
    metrics.resources = createTree(metrics.resources);
  }
  console.info(JSON.stringify(metrics, null, "\t"));
})();
