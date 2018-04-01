const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const { EventType, EventCategory, UserTiming } = require('./events');
const R = require('ramda');

class ResourcesRequests {
  static parse(events, before) {
    const mainThreadEvents = events.timelineModel().mainThreadEvents();
    const initTime = ResourcesRequests._findNavigationStart(mainThreadEvents);
    return S.chain(
      it => ResourcesRequests._buildValidResourcesRequests(mainThreadEvents, before, it, mainThreadEvents),
      initTime
    );
  }

  static _partitionEventsByMainRequest(resourceEvents) {
    return S.map(h => {
      const requestId = h.args.data.requestId;
      const resources = R.partition(r => r.args.data.requestId === requestId, resourceEvents);
      return { mainDocument: resources[0], resources: resources[1] };
    }, S.head(resourceEvents));
  }

  static _buildValidResourcesRequests(mainThreadEvents, before, it) {
    const resourcesEvents = ResourcesRequests._filterInvalidEvents(before, it, mainThreadEvents);
    const timing = ResourcesRequests._partitionEventsByMainRequest(resourcesEvents);
    return S.map(t => {
      const mainRequest = ResourcesRequests._buildMainRequest(t.mainDocument);
      const resources = ResourcesRequests._buildResourcesRequests(t.resources, it, mainRequest.url);
      resources.unshift(mainRequest);
      return resources;
    }, timing);
  }

  static _isResourceRequestEvent(event, before, initTime) {
    return (
      event.hasCategory(EventCategory.Timeline) &&
      ResourcesRequests._formatDuration(event.startTime - initTime) <= before &&
      ((event.name === EventType.ResourceSendRequest && !R.isNil(event.args.data.url)) ||
        event.name === EventType.ResourceReceiveResponse ||
        event.name === EventType.ResourceFinish)
    );
  }

  static _mergeEvents(events, initTime, url) {
    const start = events[0];
    const response = events[1];
    const finish = events[events.length - 1];
    return ResourcesRequests._convertTrace(start, response, finish, initTime, url);
  }

  static _formatSize(size) {
    return Math.round(size);
  }

  static _formatDuration(n) {
    return Math.round(n);
  }

  static _convertTiming(timing, start, finish) {
    return {
      connectStart: ResourcesRequests._formatDuration(timing.connectStart),
      connectEnd: ResourcesRequests._formatDuration(timing.connectEnd),
      dnsStart: ResourcesRequests._formatDuration(timing.dnsStart),
      dnsEnd: ResourcesRequests._formatDuration(timing.dnsEnd),
      proxyStart: ResourcesRequests._formatDuration(timing.proxyStart),
      proxyEnd: ResourcesRequests._formatDuration(timing.proxyEnd),
      pushEnd: ResourcesRequests._formatDuration(timing.pushEnd),
      pushStart: ResourcesRequests._formatDuration(timing.pushStart),
      requestStart: ResourcesRequests._formatDuration(timing.sendStart),
      requestEnd: ResourcesRequests._formatDuration(timing.sendEnd),
      sslEnd: ResourcesRequests._formatDuration(timing.sslEnd),
      sslStart: ResourcesRequests._formatDuration(timing.sslStart),
      responseStart: ResourcesRequests._formatDuration(timing.receiveHeadersEnd),
      responseEnd: ResourcesRequests._formatDuration(finish.args.data.finishTime * 1000 - start.startTime),
    };
  }

  static _getTiming(start, response, finish) {
    return S.maybe({}, t => ResourcesRequests._convertTiming(t, start, finish), S.toMaybe(response.args.data.timing));
  }

  static _getInitiator(trace) {
    return !R.isNil(trace.args.data.stackTrace) ? trace.args.data.stackTrace[0].url : null;
  }

  static _convertTrace(start, response, finish, initTime, url) {
    const timing = ResourcesRequests._getTiming(start, response, finish);
    const initiator = ResourcesRequests._getInitiator(start);
    return {
      id: start.args.data.requestId,
      url: start.args.data.url,
      startTime: ResourcesRequests._formatDuration(start.startTime - initTime),
      duration: timing.responseEnd,
      priority: start.args.data.priority,
      transferSize: ResourcesRequests._formatSize(finish.args.data.encodedDataLength),
      decodedBodyLength: ResourcesRequests._formatSize(finish.args.data.decodedBodyLength),
      mimeType: response.args.data.mimeType,
      status: response.args.data.statusCode,
      initiator: !R.isNil(initiator) ? initiator : url,
      timing: timing,
    };
  }

  static _findNavigationStart(events) {
    return S.pipe([
      S.find(e => e.hasCategory(EventCategory.UserTiming) && e.name === UserTiming.NavigationStart),
      S.map(m => m.startTime),
    ])(events);
  }

  static _filterInvalidEvents(before, it, mainThreadEvents) {
    return S.filter(t => ResourcesRequests._isResourceRequestEvent(t, before, it), mainThreadEvents);
  }

  static _buildResourcesRequests(resourcesEvents, it, url) {
    return S.pipe(
      [
        ResourcesRequests._sortByRequestId,
        ResourcesRequests._groupByRequestId,
        ResourcesRequests._filterIncompleteRequests,
        ResourcesRequests._buildRequest(it, url),
        ResourcesRequests._sortByStartTime,
      ],
      resourcesEvents
    );
  }

  static _sortByStartTime(events) {
    return S.sortBy(S.prop('startTime'), events);
  }

  static _buildMainRequest(events) {
    const start = events[0];
    const response = events[1];
    const finish = events[events.length - 1];

    const timing = ResourcesRequests._getTiming(start, response, finish);
    timing.responseEnd = timing.responseStart + timing.responseEnd;
    return {
      id: start.args.data.requestId,
      url: start.args.data.url,
      startTime: 0,
      duration: timing.responseEnd,
      priority: start.args.data.priority,
      transferSize: ResourcesRequests._formatSize(finish.args.data.encodedDataLength),
      decodedBodyLength: ResourcesRequests._formatSize(finish.args.data.decodedBodyLength),
      mimeType: response.args.data.mimeType,
      status: response.args.data.statusCode,
      timing: timing,
    };
  }

  static _buildRequest(it, url) {
    return events => S.map(t => ResourcesRequests._mergeEvents(t, it, url), events);
  }

  static _filterIncompleteRequests(events) {
    return S.filter(t => t.length > 2, events);
  }

  static _groupByRequestId(events) {
    return S.groupBy(t1 => t2 => t1.args.data.requestId === t2.args.data.requestId, events);
  }

  static _sortByRequestId(events) {
    return S.sortBy(S.props(['args', 'data', 'requestId']), events);
  }
}

module.exports = ResourcesRequests;
