const R = require('ramda');
const {
  BACKGROUND_PARSING_TRACE_TYPE,
  TRACE_CATEGORY,
  JS_PARSING_TRACE_TYPE,
  JS_COMPILE_TRACE_TYPE
} = require('./traces');

function isValidTrace(trace, initTime, before) {
  return (isValidJSTrace(trace) || isValidBackgroundTrace(trace)) &&
    !R.isNil(trace.args) &&
    !R.isNil(trace.args['runtime-call-stats']) &&
    format(trace.ts - initTime) <= before;
}

function isValidBackgroundTrace(trace) {
  return trace.cat === TRACE_CATEGORY.RuntimeStats && trace.name === 'V8.RuntimeStats';
}

function isValidJSTrace(trace) {
  return (
    trace.cat === TRACE_CATEGORY.V8 &&
    (trace.name === 'V8.Execute' ||
      trace.name === 'V8.Task' ||
      trace.name === 'V8.RunMicrotasks' ||
      trace.name === 'V8.ScriptCompiler' ||
      trace.name === 'V8.NewContext')
  );
}

function getStat(stats, metricName) {
  return R.isNil(stats[metricName]) ? 0 : stats[metricName][1];
}

function sumBackgroundParsingTrace(stats) {
  const ppbwvr = getStat(stats, BACKGROUND_PARSING_TRACE_TYPE.PreParseBackgroundWithVariableResolution);
  const pbfl = getStat(stats, BACKGROUND_PARSING_TRACE_TYPE.ParseBackgroundFunctionLiteral);
  const ppbnvr = getStat(stats, BACKGROUND_PARSING_TRACE_TYPE.PreParseBackgroundNoVariableResolution);
  const pbp = getStat(stats, BACKGROUND_PARSING_TRACE_TYPE.ParseBackgroundProgram);
  return ppbwvr + pbfl + ppbnvr + pbp;
}

function sumParsingTrace(stats) {
  const pfl = getStat(stats, JS_PARSING_TRACE_TYPE.ParseFunctionLiteral);
  const ppwvr = getStat(stats, JS_PARSING_TRACE_TYPE.PreParseWithVariableResolution);
  const pf = getStat(stats, JS_PARSING_TRACE_TYPE.ParseFunction);
  const ppnvr = getStat(stats, JS_PARSING_TRACE_TYPE.PreParseNoVariableResolution);
  const pp = getStat(stats, JS_PARSING_TRACE_TYPE.ParseProgram);
  const pe = getStat(stats, JS_PARSING_TRACE_TYPE.ParseEval);
  const jp = getStat(stats, JS_PARSING_TRACE_TYPE.JsonParse);
  const spf = getStat(stats, JS_PARSING_TRACE_TYPE.StringParseFloat);
  const pafl = getStat(stats, JS_PARSING_TRACE_TYPE.ParseArrowFunctionLiteral);
  const spi = getStat(stats, JS_PARSING_TRACE_TYPE.StringParseInt);
  const dp = getStat(stats, JS_PARSING_TRACE_TYPE.DateParse);
  return pfl + ppwvr + pf + ppnvr + pp + pe + jp + spf + pafl + spi + dp;
}

function sumCompileTrace(stats) {
  const ci = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileIgnition);
  const cf = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileFunction);
  const cif = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileIgnitionFinalization);
  const cs = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileScript);
  const csa = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileScopeAnalysis);
  const cr = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileRenumber);
  const cl = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileLazy);
  const ce = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileEval);
  const ca = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileAnalyse);
  const crrr = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileRewriteReturnResult);
  const cser = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileSerialize);
  const cfosr = getStat(stats, JS_COMPILE_TRACE_TYPE.CompileForOnStackReplacement);
  const asc = getStat(stats, JS_COMPILE_TRACE_TYPE.ApiScriptCompiler);

  return ci + cf + cif + cs + csa + cr + cl + ca + crrr + cser + cfosr + ce + asc;
}

function getBackgroundParsingTotal(traces) {
  return R.reduce((acc, t) => acc + sumBackgroundParsingTrace(t.args['runtime-call-stats']), 0, traces);
}

function getParsingTotal(traces) {
  return R.reduce((acc, t) => acc + sumParsingTrace(t.args['runtime-call-stats']), 0, traces);
}

function getCompileTotal(traces) {
  return R.reduce((acc, t) => acc + sumCompileTrace(t.args['runtime-call-stats']), 0, traces);
}

function format(n) {
  return Math.ceil(n / 1000);
}

function findNavigationStart(data) {
  return data.traceEvents
    .find(t => t.cat === "blink.user_timing" && t.name === "navigationStart");
}

function parse(data, before) {
  const initTime = findNavigationStart(data).ts;
  const validTraces = data.traceEvents.filter(t => isValidTrace(t, before, initTime));
  const t = R.partition(t => isValidBackgroundTrace(t), validTraces);
  const backgroundParsingTotal = getBackgroundParsingTotal(t[0]);
  const parsingTotal = getParsingTotal(t[1]);
  const compileTotal = getCompileTotal(t[1]);
  return {
    backgroundParse: format(backgroundParsingTotal),
    parse: format(parsingTotal),
    compile: format(compileTotal)
  };
}

module.exports = {
  parseRuntimeStats: parse
};
