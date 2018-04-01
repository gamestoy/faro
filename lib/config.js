class Config {
  static getChromeTracesCategories() {
    return [
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
      'disabled-by-default-v8.runtime_stats',
    ];
  }
}

module.exports = Config;
