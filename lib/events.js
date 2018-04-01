const RuntimeStatsEvents = {
  Compile: {
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
    ApiScriptCompiler: 'API_ScriptCompiler_CompileUnbound',
  },
  Parsing: {
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
    DateParse: 'DateParse',
  },
  BackgroundParsing: {
    PreParseBackgroundWithVariableResolution: 'PreParseBackgroundWithVariableResolution',
    ParseBackgroundFunctionLiteral: 'ParseBackgroundFunctionLiteral',
    PreParseBackgroundNoVariableResolution: 'PreParseBackgroundNoVariableResolution',
    ParseBackgroundProgram: 'ParseBackgroundProgram',
  },
};

const UserTiming = {
  NavigationStart: 'navigationStart',
};

const EventCategory = {
  Timeline: 'devtools.timeline',
  RuntimeStats: 'disabled-by-default-v8.runtime_stats',
  V8: 'v8',
  UserTiming: 'blink.user_timing',
};

const EventType = {
  Task: 'Task',
  Program: 'Program',
  EventDispatch: 'EventDispatch',
  GPUTask: 'GPUTask',
  Animation: 'Animation',
  RequestMainThreadFrame: 'RequestMainThreadFrame',
  BeginFrame: 'BeginFrame',
  NeedsBeginFrameChanged: 'NeedsBeginFrameChanged',
  BeginMainThreadFrame: 'BeginMainThreadFrame',
  ActivateLayerTree: 'ActivateLayerTree',
  DrawFrame: 'DrawFrame',
  HitTest: 'HitTest',
  ScheduleStyleRecalculation: 'ScheduleStyleRecalculation',
  RecalculateStyles: 'RecalculateStyles',
  UpdateLayoutTree: 'UpdateLayoutTree',
  InvalidateLayout: 'InvalidateLayout',
  Layout: 'Layout',
  UpdateLayer: 'UpdateLayer',
  UpdateLayerTree: 'UpdateLayerTree',
  PaintSetup: 'PaintSetup',
  Paint: 'Paint',
  PaintImage: 'PaintImage',
  Rasterize: 'Rasterize',
  RasterTask: 'RasterTask',
  ScrollLayer: 'ScrollLayer',
  CompositeLayers: 'CompositeLayers',
  ScheduleStyleInvalidationTracking: 'ScheduleStyleInvalidationTracking',
  StyleRecalcInvalidationTracking: 'StyleRecalcInvalidationTracking',
  StyleInvalidatorInvalidationTracking: 'StyleInvalidatorInvalidationTracking',
  LayoutInvalidationTracking: 'LayoutInvalidationTracking',
  LayerInvalidationTracking: 'LayerInvalidationTracking',
  PaintInvalidationTracking: 'PaintInvalidationTracking',
  ScrollInvalidationTracking: 'ScrollInvalidationTracking',
  ParseHTML: 'ParseHTML',
  ParseAuthorStyleSheet: 'ParseAuthorStyleSheet',
  TimerInstall: 'TimerInstall',
  TimerRemove: 'TimerRemove',
  TimerFire: 'TimerFire',
  XHRReadyStateChange: 'XHRReadyStateChange',
  XHRLoad: 'XHRLoad',
  CompileScript: 'v8.compile',
  EvaluateScript: 'EvaluateScript',
  CommitLoad: 'CommitLoad',
  MarkLoad: 'MarkLoad',
  MarkDOMContent: 'MarkDOMContent',
  MarkFirstPaint: 'MarkFirstPaint',
  TimeStamp: 'TimeStamp',
  ConsoleTime: 'ConsoleTime',
  UserTiming: 'UserTiming',
  ResourceSendRequest: 'ResourceSendRequest',
  ResourceReceiveResponse: 'ResourceReceiveResponse',
  ResourceReceivedData: 'ResourceReceivedData',
  ResourceFinish: 'ResourceFinish',
  RunMicrotasks: 'RunMicrotasks',
  FunctionCall: 'FunctionCall',
  GCEvent: 'GCEvent',
  MajorGC: 'MajorGC',
  MinorGC: 'MinorGC',
  JSFrame: 'JSFrame',
  JSSample: 'JSSample',
  V8Sample: 'V8Sample',
  JitCodeAdded: 'JitCodeAdded',
  JitCodeMoved: 'JitCodeMoved',
  ParseScriptOnBackground: 'v8.parseOnBackground',
  UpdateCounters: 'UpdateCounters',
  RequestAnimationFrame: 'RequestAnimationFrame',
  CancelAnimationFrame: 'CancelAnimationFrame',
  FireAnimationFrame: 'FireAnimationFrame',
  RequestIdleCallback: 'RequestIdleCallback',
  CancelIdleCallback: 'CancelIdleCallback',
  FireIdleCallback: 'FireIdleCallback',
  WebSocketCreate: 'WebSocketCreate',
  WebSocketSendHandshakeRequest: 'WebSocketSendHandshakeRequest',
  WebSocketReceiveHandshakeResponse: 'WebSocketReceiveHandshakeResponse',
  WebSocketDestroy: 'WebSocketDestroy',
  EmbedderCallback: 'EmbedderCallback',
  SetLayerTreeId: 'SetLayerTreeId',
  TracingStartedInPage: 'TracingStartedInPage',
  TracingSessionIdForWorker: 'TracingSessionIdForWorker',
  DecodeImage: 'Decode Image',
  ResizeImage: 'Resize Image',
  DrawLazyPixelRef: 'Draw LazyPixelRef',
  DecodeLazyPixelRef: 'Decode LazyPixelRef',
  LazyPixelRef: 'LazyPixelRef',
  LayerTreeHostImplSnapshot: 'cc::LayerTreeHostImpl',
  PictureSnapshot: 'cc::Picture',
  DisplayItemListSnapshot: 'cc::DisplayItemList',
  LatencyInfo: 'LatencyInfo',
  LatencyInfoFlow: 'LatencyInfo.Flow',
  InputLatencyMouseMove: 'InputLatency::MouseMove',
  InputLatencyMouseWheel: 'InputLatency::MouseWheel',
  ImplSideFling: 'InputHandlerProxy::HandleGestureFling::started',
  GCIdleLazySweep: 'ThreadState::performIdleLazySweep',
  GCCompleteSweep: 'ThreadState::completeSweep',
  GCCollectGarbage: 'BlinkGCMarking',
  CpuProfile: 'CpuProfile',

  V8Execute: 'V8.Execute',
  V8Taks: 'V8.Task',
  V8RunMicrotasks: 'V8.RunMicrotasks',
  V8ScriptCompiler: 'V8.ScriptCompiler',
  V8NewContext: 'V8.NewContext',
  V8RuntimeStats: 'V8.RuntimeStats',
};

const Groups = {
  Scripting: 'script_evaluation',
  ScriptParseCompile: 'script_parse_compile',
  Other: 'other',
};

const eventGrouping = (() => {
  const eventGrouping = {};
  eventGrouping[EventType.CancelAnimationFrame] = Groups.Scripting;
  eventGrouping[EventType.CancelIdleCallback] = Groups.Scripting;
  eventGrouping[EventType.CompileScript] = Groups.ScriptParseCompile;
  eventGrouping[EventType.ConsoleTime] = Groups.Scripting;
  eventGrouping[EventType.EmbedderCallback] = Groups.Scripting;
  eventGrouping[EventType.EvaluateScript] = Groups.Scripting;
  eventGrouping[EventType.EventDispatch] = Groups.Scripting;
  eventGrouping[EventType.FireAnimationFrame] = Groups.Scripting;
  eventGrouping[EventType.FireIdleCallback] = Groups.Scripting;
  eventGrouping[EventType.MarkLoad] = Groups.Scripting;
  eventGrouping[EventType.ParseScriptOnBackground] = Groups.ScriptParseCompile;
  eventGrouping[EventType.MarkDOMContent] = Groups.Scripting;
  eventGrouping[EventType.FunctionCall] = Groups.Scripting;
  eventGrouping[EventType.JSFrame] = Groups.Scripting;
  eventGrouping[EventType.LatencyInfo] = Groups.Scripting;
  eventGrouping[EventType.TimerFire] = Groups.Scripting;
  eventGrouping[EventType.RunMicrotasks] = Groups.Scripting;
  eventGrouping[EventType.RequestAnimationFrame] = Groups.Scripting;
  eventGrouping[EventType.RequestIdleCallback] = Groups.Scripting;
  eventGrouping[EventType.TimerInstall] = Groups.Scripting;
  eventGrouping[EventType.TimerRemove] = Groups.Scripting;
  eventGrouping[EventType.XHRReadyStateChange] = Groups.Scripting;
  eventGrouping[EventType.XHRLoad] = Groups.Scripting;
  eventGrouping[EventType.TimeStamp] = Groups.Scripting;
  eventGrouping[EventType.UserTiming] = Groups.Scripting;
  eventGrouping[EventType.WebSocketCreate] = Groups.Scripting;
  eventGrouping[EventType.WebSocketSendHandshakeRequest] = Groups.Scripting;
  eventGrouping[EventType.WebSocketReceiveHandshakeResponse] = Groups.Scripting;
  eventGrouping[EventType.WebSocketDestroy] = Groups.Scripting;
  return eventGrouping;
})();

const VirtualThreads = {
  BackgroundParsing: 'ScriptStreamer thread',
};

module.exports = {
  EventCategory,
  RuntimeStatsEvents,
  EventType,
  eventGrouping,
  Groups,
  UserTiming,
  VirtualThreads,
};
