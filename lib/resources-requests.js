const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const { EventType, EventCategory, UserTiming } = require('./events');
const { ContentType, ResourceType, Extension } = require('./resources');
const R = require('ramda');

const build = events => {
  const mainThreadEvents = events.timelineModel().mainThreadEvents();
  const initTime = findNavigationStart(mainThreadEvents);
  return S.chain(it => buildValidResourcesRequests(mainThreadEvents, it, mainThreadEvents), initTime);
};

const partitionEventsByMainRequest = resourceEvents => {
  return S.map(h => {
    const requestId = h.args.data.requestId;
    const resources = R.partition(r => r.args.data.requestId === requestId, resourceEvents);
    return { mainDocument: resources[0], resources: resources[1] };
  }, S.head(resourceEvents));
};

const buildValidResourcesRequests = (mainThreadEvents, it) => {
  const resourcesEvents = filterInvalidEvents(mainThreadEvents);
  const timing = partitionEventsByMainRequest(resourcesEvents);
  return S.chain(t => {
    const mainRequest = buildMainRequest(t.mainDocument);
    return S.map(mr => {
      const resources = buildResourcesRequests(t.resources, it);
      resources.unshift(mr);
      return resources;
    }, mainRequest);
  }, timing);
};

const isResourceRequestEvent = (event) => {
  return (
    event.hasCategory(EventCategory.Timeline) &&
    ((event.name === EventType.ResourceSendRequest && !R.isNil(event.args.data.url)) ||
      event.name === EventType.ResourceReceiveResponse ||
      event.name === EventType.ResourceFinish)
  );
};

const mergeEvents = (events, initTime) => {
  const eventsObj = findEvents(events);
  return S.map(evs => convertTrace(evs.start, evs.response, evs.finish, initTime), eventsObj);
};

const formatSize = size => {
  return Math.round(size);
};

const formatDuration = n => {
  return Math.round(n);
};

const convertTiming = timing => {
  return {
    connectStart: formatDuration(timing.connectStart),
    connectEnd: formatDuration(timing.connectEnd),
    dnsStart: formatDuration(timing.dnsStart),
    dnsEnd: formatDuration(timing.dnsEnd),
    proxyStart: formatDuration(timing.proxyStart),
    proxyEnd: formatDuration(timing.proxyEnd),
    pushEnd: formatDuration(timing.pushEnd),
    pushStart: formatDuration(timing.pushStart),
    requestStart: formatDuration(timing.sendStart),
    requestEnd: formatDuration(timing.sendEnd),
    sslEnd: formatDuration(timing.sslEnd),
    sslStart: formatDuration(timing.sslStart),
    responseStart: formatDuration(timing.receiveHeadersEnd),
  };
};

const convertTrace = (start, response, finish, initTime) => {
  const timing = getTiming(start, response, finish);
  const duration = formatDuration(finish.startTime - start.startTime);
  return {
    url: start.args.data.url,
    startTime: formatDuration(start.startTime - initTime),
    duration: duration,
    priority: start.args.data.priority,
    transferSize: formatSize(finish.args.data.encodedDataLength),
    decodedBodyLength: formatSize(finish.args.data.decodedBodyLength),
    type: convertContentType(response.args.data.mimeType, start.args.data.url),
    status: response.args.data.statusCode,
    timing: timing,
    fromCache: response.args.data.fromCache,
    fromServiceWorker: response.args.data.fromServiceWorker,
  };
};

const getTiming = (start, response, finish) => {
  return S.maybe({}, t => convertTiming(t, start, finish), S.toMaybe(response.args.data.timing));
};

const convertContentType = (mimeType, url) => {
  return !R.isNil(ContentType[mimeType]) ? ContentType[mimeType] : getContentTypeByFileExtension(url);
};

const getContentTypeByFileExtension = url => {
  const ext = url.substr(url.lastIndexOf('.') + 1);
  return !R.isNil(Extension[ext]) ? Extension[ext] : ResourceType.Other;
};

const findNavigationStart = events => {
  return S.pipe([
    S.find(e => e.hasCategory(EventCategory.UserTiming) && e.name === UserTiming.NavigationStart),
    S.map(m => m.startTime),
  ])(events);
};

const filterInvalidEvents = (mainThreadEvents) => {
  return S.filter(t => isResourceRequestEvent(t), mainThreadEvents);
};

const buildResourcesRequests = (resourcesEvents, it) => {
  return S.pipe(
    [
      sortByRequestId,
      groupByRequestId,
      filterIncompleteRequests,
      buildRequest(it),
      filterInvalidRequest,
      sortByStartTime,
    ],
    resourcesEvents
  );
};

const filterInvalidRequest = requests => {
  return S.mapMaybe(S.id(Function), S.filter(S.isJust, requests));
};

const sortByStartTime = events => {
  return S.sortBy(S.prop('startTime'), events);
};

const findEvents = events => {
  const start = S.last(S.filter(e => e.name === EventType.ResourceSendRequest, events));
  const response = S.find(e => e.name === EventType.ResourceReceiveResponse, events);
  const finish = S.find(e => e.name === EventType.ResourceFinish, events);
  return S.chain(s =>
      S.chain(r =>
          S.map(f => {
            return {
              start: s,
              response: r,
              finish: f,
            };
          }, finish),
        response),
    start);
};

const buildMainRequest = events => {
  const eventsObj = findEvents(events);
  return S.map(evs => {
    const timing = getTiming(evs.start, evs.response, evs.finish);
    const duration = timing.responseStart + evs.finish.args.data.finishTime * 1000 - evs.start.startTime;
    return {
      url: evs.start.args.data.url,
      startTime: 0,
      duration: formatDuration(duration),
      priority: evs.start.args.data.priority,
      transferSize: formatSize(evs.finish.args.data.encodedDataLength),
      decodedBodyLength: formatSize(evs.finish.args.data.decodedBodyLength),
      type: convertContentType(evs.response.args.data.mimeType, evs.start.args.data.url),
      status: evs.response.args.data.statusCode,
      timing: timing,
    };
  }, eventsObj);
};

const buildRequest = (it) => {
  return events => S.map(t => mergeEvents(t, it), events);
};

const filterIncompleteRequests = events => {
  return S.filter(t => t.length > 2, events);
};

const groupByRequestId = events => {
  return S.groupBy(t1 => t2 => t1.args.data.requestId === t2.args.data.requestId, events);
};

const sortByRequestId = events => {
  return S.sortBy(S.props(['args', 'data', 'requestId']), events);
};

module.exports = {
  buildRequests: build,
};
