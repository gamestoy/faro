const { create, env } = require('sanctuary');
const R = require('ramda');
const S = create({ checkTypes: false, env });

class Coverage {
  constructor(page) {
    this._coverage = page.coverage;
    this._coverageStarted = false;
    this._jsCoverage = null;
    this._cssCoverage = null;
  }

  async startCoverage() {
    await Promise.all([
      this._coverage.startJSCoverage(),
      this._coverage.startCSSCoverage()
    ]);
    this._coverageStarted = true;
  }

  async stopCoverage() {
    if (this._coverageStarted) {
      const [jsCoverage, cssCoverage] = await Promise.all([
        this._coverage.stopJSCoverage(),
        this._coverage.stopCSSCoverage()
      ]);
      this._coverageStarted = false;
      this._cssCoverage = cssCoverage;
      this._jsCoverage = jsCoverage;
    }
  }

  getCoverage() {
    return { css_coverage: this._calculateCoverage(this._cssCoverage), js_coverage: this._calculateCoverage(this._jsCoverage) }
  }

  _calculateCoverage(entries) {
    return S.pipe([
      this._calculateEntryCoverage,
      R.groupWith((r1, r2) => r1.url === r2.url),
      S.map(g => this._calculateGroupCoverage(g)),
      S.sortBy(v => -1 * S.props(['unused_bytes', 'value'], v)),
    ])(entries);
  }

  _calculateGroupCoverage(group) {
    const [totalBytes, usedBytes] = this._calculateGroupTotals(group);
    const unusedBytes = totalBytes - usedBytes;
    const percentage = Math.round(unusedBytes * 100.0 / totalBytes);
    return {
      url: group[0].url,
      total_bytes: totalBytes,
      unused_bytes: {
        value: unusedBytes,
        percentage: percentage,
      }
    }
  }

  _calculateGroupTotals(group) {
    return S.reduce(
      ([total, used]) => u => [total + u.total_bytes, used + u.used_bytes],
      [0, 0],
      group);
  }

  _calculateEntryCoverage(entries) {
    return S.map(e => {
      const total = e.text.length;
      const used = S.reduce(acc => r => acc + r.end - r.start - 1, 0, e.ranges);
      return {
        url: e.url,
        total_bytes: total,
        used_bytes: used,
      };
    }, entries);
  }
}

module.exports = Coverage;