const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });

const build = traces => {
  const groupedByEvent = buildBy('EventName')(traces);
  const groupedByCategory = buildBy('Category')(traces);
  return {
      event: groupedByEvent,
      category: groupedByCategory,
  };
};

const buildBy = type => traces => {
  return S.map(m => buildMetric(... m), Array.from(traces.bottomUpGroupBy(type).children));
};

const buildMetric = (name, values) => {
  return {
    name: name,
    duration: Math.ceil(values.selfTime),
  };
};

module.exports = {
  buildMainThreadStats: build,
};
