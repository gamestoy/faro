const RESOURCE_TYPE = {
  Image: 'image',
  Font: 'font',
  Javascript: 'javascript',
  Html: 'html',
  Json: 'json'
};

const CHROME_TRACES_CATEGORIES = [
  '-*',
  'devtools.timeline',
  'v8.execute',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'toplevel',
  'blink.console',
  'blink.user_timing',
  'latencyInfo',
  'disabled-by-default-devtools.timeline.stack',
  'disabled-by-default-v8.cpu_profiler',
  'v8',
  'disabled-by-default-v8.runtime_stats'
];

const TIMELINE_TRACE_TYPE = {
  RequestStart: 'ResourceSendRequest',
  ResponseStart: 'ResourceReceiveResponse',
  ResponseComplete: 'ResourceFinish'
};

const JS_COMPILE_TRACE_TYPE = {
  CompileIgnition: 'CompileIgnition',
  CompileFunction: 'CompileFunction',
  CompileIgnitionFinalization: 'CompileIgnitionFinalization',
  CompileScript: 'CompileScript',
  CompileScopeAnalysis: 'CompileScopeAnalysis',
  CompileRenumber: 'CompileRenumber',
  CompileLazy: 'CompileLazy',
  CompileEval: 'CompileEval',
  CompileAnalyse: 'CompileAnalyse',
  CompileRewriteReturnResult: 'CompileRewriteReturnResult',
  CompileSerialize: 'CompileSerialize',
  CompileForOnStackReplacement: 'CompileForOnStackReplacement',
  ApiScriptCompiler: 'API_ScriptCompiler_CompileUnbound'
};

const JS_PARSING_TRACE_TYPE = {
  ParseFunctionLiteral: 'ParseFunctionLiteral',
  PreParseWithVariableResolution: 'PreParseWithVariableResolution',
  ParseFunction: 'ParseFunction',
  PreParseNoVariableResolution: 'PreParseNoVariableResolution',
  ParseProgram: 'ParseProgram',
  ParseEval: 'ParseEval',
  JsonParse: 'JsonParse',
  StringParseFloat: 'StringParseFloat',
  ParseArrowFunctionLiteral: 'ParseArrowFunctionLiteral',
  PreParseArrowFunctionLiteral: 'PreParseArrowFunctionLiteral',
  StringParseInt: 'StringParseInt',
  DateParse: 'DateParse'
};

const BACKGROUND_PARSING_TRACE_TYPE = {
  PreParseBackgroundWithVariableResolution: 'PreParseBackgroundWithVariableResolution',
  ParseBackgroundFunctionLiteral: 'ParseBackgroundFunctionLiteral',
  PreParseBackgroundNoVariableResolution: 'PreParseBackgroundNoVariableResolution',
  ParseBackgroundProgram: 'ParseBackgroundProgram'
};

const TRACE_CATEGORY = {
  Timeline: 'devtools.timeline',
  RuntimeStats: 'disabled-by-default-v8.runtime_stats',
  V8: 'v8'
};

const CONTENT_TYPE = {
  'image/jpeg': RESOURCE_TYPE.Image,
  'application/javascript': RESOURCE_TYPE.Javascript,
  'text/html': RESOURCE_TYPE.Html,
  'image/webp': RESOURCE_TYPE.Image,
  'font/woff': RESOURCE_TYPE.Font,
  'font/woff2': RESOURCE_TYPE.Font,
  'application/xhtml+xml': RESOURCE_TYPE.Html,
  'image/svg+xml': RESOURCE_TYPE.Image,
  'image/gif': RESOURCE_TYPE.Image,
  'font/ttf': RESOURCE_TYPE.Font,
  'application/json': RESOURCE_TYPE.Json
};

module.exports = {
  CONTENT_TYPE,
  RESOURCE_TYPE,
  TIMELINE_TRACE_TYPE,
  TRACE_CATEGORY,
  BACKGROUND_PARSING_TRACE_TYPE,
  JS_PARSING_TRACE_TYPE,
  JS_COMPILE_TRACE_TYPE,
  CHROME_TRACES_CATEGORIES
};
