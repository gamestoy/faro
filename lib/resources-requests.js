const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const { EventType, EventCategory, UserTiming } = require('./events');
const { ContentType, ResourceType, Extension } = require('./resources');
const R = require('ramda');

const build = (events, before) => {
  const mainThreadEvents = events.timelineModel().mainThreadEvents();
  const initTime = findNavigationStart(mainThreadEvents);
  return S.chain(it => buildValidResourcesRequests(mainThreadEvents, before, it, mainThreadEvents), initTime);
};

const partitionEventsByMainRequest = resourceEvents => {
  return S.map(h => {
    const requestId = h.args.data.requestId;
    const resources = R.partition(r => r.args.data.requestId === requestId, resourceEvents);
    return { mainDocument: resources[0], resources: resources[1] };
  }, S.head(resourceEvents));
};

const buildValidResourcesRequests = (mainThreadEvents, before, it) => {
  const resourcesEvents = filterInvalidEvents(before, it, mainThreadEvents);
  const timing = partitionEventsByMainRequest(resourcesEvents);
  return S.map(t => {
    const mainRequest = buildMainRequest(t.mainDocument);
    const resources = buildResourcesRequests(t.resources, it, mainRequest.url);
    resources.unshift(mainRequest);
    return resources;
  }, timing);
};

const isResourceRequestEvent = (event, before, initTime) => {
  return (
    event.hasCategory(EventCategory.Timeline) &&
    formatDuration(event.startTime - initTime) <= before &&
    ((event.name === EventType.ResourceSendRequest && !R.isNil(event.args.data.url)) ||
      event.name === EventType.ResourceReceiveResponse ||
      event.name === EventType.ResourceFinish)
  );
};

const mergeEvents = (events, initTime, url) => {
  const start = events[0];
  const response = events[1];
  const finish = events[events.length - 1];
  return convertTrace(start, response, finish, initTime, url);
};

const formatSize = size => {
  return Math.round(size);
};

const formatDuration = n => {
  return Math.round(n);
};

const convertTiming = (timing, start, finish) => {
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
    responseEnd: formatDuration(finish.args.data.finishTime * 1000 - start.startTime),
  };
};

const getTiming = (start, response, finish) => {
  return S.maybe({}, t => convertTiming(t, start, finish), S.toMaybe(response.args.data.timing));
};

const getInitiator = trace => {
  return !R.isNil(trace.args.data.stackTrace) ? trace.args.data.stackTrace[0].url : null;
};

const convertTrace = (start, response, finish, initTime, url) => {
  const timing = getTiming(start, response, finish);
  const initiator = getInitiator(start);
  return {
    id: start.args.data.requestId,
    url: start.args.data.url,
    startTime: formatDuration(start.startTime - initTime),
    duration: timing.responseEnd,
    priority: start.args.data.priority,
    transferSize: formatSize(finish.args.data.encodedDataLength),
    decodedBodyLength: formatSize(finish.args.data.decodedBodyLength),
    type: convertContentType(response.args.data.mimeType, start.args.data.url),
    status: response.args.data.statusCode,
    initiator: !R.isNil(initiator) ? initiator : url,
    timing: timing,
  };
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

const filterInvalidEvents = (before, it, mainThreadEvents) => {
  return S.filter(t => isResourceRequestEvent(t, before, it), mainThreadEvents);
};

const buildResourcesRequests = (resourcesEvents, it, url) => {
  return S.pipe(
    [sortByRequestId, groupByRequestId, filterIncompleteRequests, buildRequest(it, url), sortByStartTime],
    resourcesEvents
  );
};

const sortByStartTime = events => {
  return S.sortBy(S.prop('startTime'), events);
};

const buildMainRequest = events => {
  const start = events[0];
  const response = events[1];
  const finish = events[events.length - 1];

  const timing = getTiming(start, response, finish);
  timing.responseEnd = timing.responseStart + timing.responseEnd;
  return {
    id: start.args.data.requestId,
    url: start.args.data.url,
    startTime: 0,
    duration: timing.responseEnd,
    priority: start.args.data.priority,
    transferSize: formatSize(finish.args.data.encodedDataLength),
    decodedBodyLength: formatSize(finish.args.data.decodedBodyLength),
    type: convertContentType(response.args.data.mimeType, start.args.data.url),
    status: response.args.data.statusCode,
    timing: timing,
  };
};

const buildRequest = (it, url) => {
  return events => S.map(t => mergeEvents(t, it, url), events);
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
