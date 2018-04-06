const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');
const { EventCategory, RuntimeStatsEvents, UserTiming, VirtualThreads, EventType } = require('./events');

const RUNTIME_STATS_FIELD = 'runtime-call-stats';

const isValidEvent = (event) => {
  return (
    (isValidJSEvent(event) || isValidBackgroundEvent(event)) &&
    !R.isNil(event.args) &&
    !R.isNil(event.args[RUNTIME_STATS_FIELD])
  );
};

const isValidBackgroundEvent = event => {
  return event.hasCategory(EventCategory.RuntimeStats) && event.name === EventType.V8RuntimeStats;
};

const isValidJSEvent = event => {
  return (
    event.hasCategory(EventCategory.V8) &&
    (event.name === EventType.V8Execute ||
      event.name === EventType.V8Taks ||
      event.name === EventType.V8RunMicrotasks ||
      event.name === EventType.V8ScriptCompiler ||
      event.name === EventType.V8NewContext)
  );
};

const getStat = (stats, metricName) => {
  return !R.isNil(stats[metricName]) ? stats[metricName][1] : 0;
};

const sumBackgroundParsingTrace = stats => {
  const ppbwvr = getStat(stats, RuntimeStatsEvents.BackgroundParsing.PreParseBackgroundWithVariableResolution);
  const pbfl = getStat(stats, RuntimeStatsEvents.BackgroundParsing.ParseBackgroundFunctionLiteral);
  const ppbnvr = getStat(stats, RuntimeStatsEvents.BackgroundParsing.PreParseBackgroundNoVariableResolution);
  const pbp = getStat(stats, RuntimeStatsEvents.BackgroundParsing.ParseBackgroundProgram);
  return ppbwvr + pbfl + ppbnvr + pbp;
};

const sumParsingTrace = stats => {
  const pfl = getStat(stats, RuntimeStatsEvents.Parsing.ParseFunctionLiteral);
  const ppwvr = getStat(stats, RuntimeStatsEvents.Parsing.PreParseWithVariableResolution);
  const pf = getStat(stats, RuntimeStatsEvents.Parsing.ParseFunction);
  const ppnvr = getStat(stats, RuntimeStatsEvents.Parsing.PreParseNoVariableResolution);
  const pp = getStat(stats, RuntimeStatsEvents.Parsing.ParseProgram);
  const pe = getStat(stats, RuntimeStatsEvents.Parsing.ParseEval);
  const jp = getStat(stats, RuntimeStatsEvents.Parsing.JsonParse);
  const spf = getStat(stats, RuntimeStatsEvents.Parsing.StringParseFloat);
  const pafl = getStat(stats, RuntimeStatsEvents.Parsing.ParseArrowFunctionLiteral);
  const spi = getStat(stats, RuntimeStatsEvents.Parsing.StringParseInt);
  const dp = getStat(stats, RuntimeStatsEvents.Parsing.DateParse);
  return pfl + ppwvr + pf + ppnvr + pp + pe + jp + spf + pafl + spi + dp;
};

const sumCompileTrace = stats => {
  const ci = getStat(stats, RuntimeStatsEvents.Compile.CompileIgnition);
  const cf = getStat(stats, RuntimeStatsEvents.Compile.CompileFunction);
  const cif = getStat(stats, RuntimeStatsEvents.Compile.CompileIgnitionFinalization);
  const cs = getStat(stats, RuntimeStatsEvents.Compile.CompileScript);
  const csa = getStat(stats, RuntimeStatsEvents.Compile.CompileScopeAnalysis);
  const cr = getStat(stats, RuntimeStatsEvents.Compile.CompileRenumber);
  const cl = getStat(stats, RuntimeStatsEvents.Compile.CompileLazy);
  const ce = getStat(stats, RuntimeStatsEvents.Compile.CompileEval);
  const ca = getStat(stats, RuntimeStatsEvents.Compile.CompileAnalyse);
  const crrr = getStat(stats, RuntimeStatsEvents.Compile.CompileRewriteReturnResult);
  const cser = getStat(stats, RuntimeStatsEvents.Compile.CompileSerialize);
  const cfosr = getStat(stats, RuntimeStatsEvents.Compile.CompileForOnStackReplacement);
  const asc = getStat(stats, RuntimeStatsEvents.Compile.ApiScriptCompiler);

  return ci + cf + cif + cs + csa + cr + cl + ca + crrr + cser + cfosr + ce + asc;
};

const getBackgroundParsingTotal = events => {
  return S.reduce(acc => e => acc + sumBackgroundParsingTrace(e.args[RUNTIME_STATS_FIELD]), 0, events);
};

const getParsingTotal = traces => {
  return S.reduce(acc => e => acc + sumParsingTrace(e.args[RUNTIME_STATS_FIELD]), 0, traces);
};

const getCompileTotal = traces => {
  return S.reduce(acc => e => acc + sumCompileTrace(e.args[RUNTIME_STATS_FIELD]), 0, traces);
};

const format = n => {
  return Math.ceil(n / 1000);
};

const findNavigationStart = model => {
  const nvSt = S.find(
    e => e.hasCategory(EventCategory.UserTiming) && e.name === UserTiming.NavigationStart,
    model.mainThreadEvents()
  );
  return S.map(e => e.startTime, nvSt);
};

const build = (events) => {
  const model = events.timelineModel();
  return parseStats(model);
};

const parseStats = (model) => {
  const validEvents = getValidMainThreadEvents(model);
  const parsingTotal = getParsingTotal(validEvents);
  const compileTotal = getCompileTotal(validEvents);
  const backgroundParsingTotal = S.map(es => getBackgroundParsingTotal(es), getBackgroundEvents(model));
  return {
    backgroundParse: S.maybe(0, bck => format(bck), backgroundParsingTotal),
    parse: format(parsingTotal),
    compile: format(compileTotal),
  };
};

const getValidMainThreadEvents = (model) => {
  return S.filter(e => isValidEvent(e), model.mainThreadEvents());
};

const getBackgroundEvents = model => {
  const streamerThread = S.find(t => t.name === VirtualThreads.BackgroundParsing, model.virtualThreads());
  return S.map(st => S.filter(e => isValidBackgroundEvent(e), st.events), streamerThread);
};

module.exports = {
  buildV8RuntimeStats: build,
};
