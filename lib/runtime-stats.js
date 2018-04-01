const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const R = require('ramda');
const { EventCategory, RuntimeStatsEvents, UserTiming, VirtualThreads, EventType } = require('./events');

const RUNTIME_STATS_FIELD = 'runtime-call-stats';

class V8RuntimeStats {
  static _isValidEvent(event, initTime, before) {
    return (
      (V8RuntimeStats._isValidJSEvent(event) || V8RuntimeStats._isValidBackgroundEvent(event)) &&
      !R.isNil(event.args) &&
      !R.isNil(event.args[RUNTIME_STATS_FIELD]) &&
      V8RuntimeStats._format(event.startTime - initTime) <= before
    );
  }

  static _isValidBackgroundEvent(event) {
    return event.hasCategory(EventCategory.RuntimeStats) && event.name === EventType.V8RuntimeStats;
  }

  static _isValidJSEvent(event) {
    return (
      event.hasCategory(EventCategory.V8) &&
      (event.name === EventType.V8Execute ||
        event.name === EventType.V8Taks ||
        event.name === EventType.V8RunMicrotasks ||
        event.name === EventType.V8ScriptCompiler ||
        event.name === EventType.V8NewContext)
    );
  }

  static _getStat(stats, metricName) {
    return !R.isNil(stats[metricName]) ? stats[metricName][1] : 0;
  }

  static _sumBackgroundParsingTrace(stats) {
    const ppbwvr = V8RuntimeStats._getStat(
      stats,
      RuntimeStatsEvents.BackgroundParsing.PreParseBackgroundWithVariableResolution
    );
    const pbfl = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.BackgroundParsing.ParseBackgroundFunctionLiteral);
    const ppbnvr = V8RuntimeStats._getStat(
      stats,
      RuntimeStatsEvents.BackgroundParsing.PreParseBackgroundNoVariableResolution
    );
    const pbp = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.BackgroundParsing.ParseBackgroundProgram);
    return ppbwvr + pbfl + ppbnvr + pbp;
  }

  static _sumParsingTrace(stats) {
    const pfl = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.ParseFunctionLiteral);
    const ppwvr = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.PreParseWithVariableResolution);
    const pf = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.ParseFunction);
    const ppnvr = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.PreParseNoVariableResolution);
    const pp = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.ParseProgram);
    const pe = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.ParseEval);
    const jp = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.JsonParse);
    const spf = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.StringParseFloat);
    const pafl = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.ParseArrowFunctionLiteral);
    const spi = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.StringParseInt);
    const dp = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Parsing.DateParse);
    return pfl + ppwvr + pf + ppnvr + pp + pe + jp + spf + pafl + spi + dp;
  }

  static _sumCompileTrace(stats) {
    const ci = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileIgnition);
    const cf = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileFunction);
    const cif = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileIgnitionFinalization);
    const cs = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileScript);
    const csa = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileScopeAnalysis);
    const cr = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileRenumber);
    const cl = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileLazy);
    const ce = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileEval);
    const ca = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileAnalyse);
    const crrr = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileRewriteReturnResult);
    const cser = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileSerialize);
    const cfosr = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.CompileForOnStackReplacement);
    const asc = V8RuntimeStats._getStat(stats, RuntimeStatsEvents.Compile.ApiScriptCompiler);

    return ci + cf + cif + cs + csa + cr + cl + ca + crrr + cser + cfosr + ce + asc;
  }

  static _getBackgroundParsingTotal(events) {
    return S.reduce(
      acc => e => acc + V8RuntimeStats._sumBackgroundParsingTrace(e.args[RUNTIME_STATS_FIELD]),
      0,
      events
    );
  }

  static _getParsingTotal(traces) {
    return S.reduce(acc => e => acc + V8RuntimeStats._sumParsingTrace(e.args[RUNTIME_STATS_FIELD]), 0, traces);
  }

  static _getCompileTotal(traces) {
    return S.reduce(acc => e => acc + V8RuntimeStats._sumCompileTrace(e.args[RUNTIME_STATS_FIELD]), 0, traces);
  }

  static _format(n) {
    return Math.ceil(n / 1000);
  }

  static _findNavigationStart(model) {
    const nvSt = S.find(
      e => e.hasCategory(EventCategory.UserTiming) && e.name === UserTiming.NavigationStart,
      model.mainThreadEvents()
    );
    return S.map(e => e.startTime, nvSt);
  }

  static parse(events, before) {
    const model = events.timelineModel();
    const stats = S.map(initTime => {
      return V8RuntimeStats.parseStats(model, before, initTime);
    }, V8RuntimeStats._findNavigationStart(model));

    return S.fromMaybe({}, stats);
  }

  static parseStats(model, before, initTime) {
    const validEvents = V8RuntimeStats._getValidMainThreadEvents(model, before, initTime);
    const parsingTotal = V8RuntimeStats._getParsingTotal(validEvents);
    const compileTotal = V8RuntimeStats._getCompileTotal(validEvents);
    const backgroundParsingTotal = S.map(
      es => V8RuntimeStats._getBackgroundParsingTotal(es),
      V8RuntimeStats._getBackgroundEvents(model)
    );
    return {
      backgroundParse: S.maybe(0, bck => V8RuntimeStats._format(bck), backgroundParsingTotal),
      parse: V8RuntimeStats._format(parsingTotal),
      compile: V8RuntimeStats._format(compileTotal),
    };
  }

  static _getValidMainThreadEvents(model, before, initTime) {
    return S.filter(e => V8RuntimeStats._isValidEvent(e, before, initTime), model.mainThreadEvents());
  }

  static _getBackgroundEvents(model) {
    const streamerThread = S.find(t => t.name === VirtualThreads.BackgroundParsing, model.virtualThreads());
    return S.map(st => S.filter(e => V8RuntimeStats._isValidBackgroundEvent(e), st.events), streamerThread);
  }
}

module.exports = V8RuntimeStats;
