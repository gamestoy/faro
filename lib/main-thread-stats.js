class MainThreadStats {
  static create(traces) {
    const groupedByEvent = traces.bottomUpGroupBy('EventName');
    return Array.from(groupedByEvent.children).map(e => {
      return {
        name: e[0],
        duration: Math.ceil(e[1].selfTime),
      };
    });
  }
}

module.exports = MainThreadStats;
