const { create, env } = require('sanctuary');
const S = create({ checkTypes: false, env });
const { EventType, EventCategory, UserTiming } = require('./events');
const { ContentType, ResourceType, Extension } = require('./resources');
const R = require('ramda');

const build = (events, before) => {
  const initTime = findNavigationStart(events.timelineModel().mainThreadEvents());
  return S.chain(it => buildValidResourcesRequests(events.timelineModel().networkRequests(), before, it), initTime);
};

const partitionRequestsByMainRequest = requests => {
  return S.chain(h => {
    return S.map(rs => {
      return { mainDocument: h, resources: rs };
    }, S.tail(requests));
  }, S.head(requests));
};

const buildValidResourcesRequests = (networkRequests, before, it) => {
  const requests = filterInvalidEvents(networkRequests, before, it);
  const timing = partitionRequestsByMainRequest(requests);
  return S.chain(t => {
    const mainRequest = buildMainRequest(t.mainDocument);
    return S.map(mr => {
      const resources = buildResourcesRequests(t.resources, it);
      resources.unshift(mr);
      return resources;
    }, mainRequest);
  }, timing);
};

const isResourceRequestEvent = (request, before, initTime) => {
  return (
    !R.isNil(request.url) &&
    formatDuration(request.startTime - initTime) <= before
  );
};

const findNavigationStart = events => {
  return S.pipe([
    S.find(e => e.hasCategory(EventCategory.UserTiming) && e.name === UserTiming.NavigationStart),
    S.map(m => m.startTime),
  ])(events);
};

const filterInvalidEvents = (networkRequests, before, it) => {
  return S.filter(t => isResourceRequestEvent(t, before, it), networkRequests);
};

const buildResourcesRequests = (resourceRequests, it) => {
  return S.pipe(
    [
      filterIncompleteRequests,
      buildRequests(it),
      filterInvalidRequest,
      sortByStartTime,
    ],
    resourceRequests
  );
};

const filterInvalidRequest = requests => {
  return S.mapMaybe(S.id(Function), S.filter(S.isJust, requests));
};

const sortByStartTime = events => {
  return S.sortBy(S.prop('startTime'), events);
};

const buildMainRequest = request => {
  const eventsObj = findEvents(request.children);
  return S.map(evs => {
    const timing = getTiming(request);
    const duration = formatDuration(timing.responseStart + request.finishTime - request.startTime);
    return {
      url: request.url,
      startTime: 0,
      duration: duration,
      priority: request.priority,
      transferSize: formatSize(request.encodedDataLength),
      decodedBodyLength: formatSize(evs.finish.args.data.decodedBodyLength),
      type: convertContentType(request.mimeType, request.url),
      status: evs.response.args.data.statusCode,
      timing: timing,
    };
  }, eventsObj);
};

const buildRequest = (request, initTime) => {
  const eventsObj = findEvents(request.children);
  return S.map(evs => {
    const timing = getTiming(request);
    const duration = formatDuration(request.finishTime - request.startTime);
    return {
      url: request.url,
      startTime: formatDuration(request.startTime - initTime),
      duration: duration,
      priority: request.priority,
      transferSize: formatSize(request.encodedDataLength),
      decodedBodyLength: formatSize(evs.finish.args.data.decodedBodyLength),
      type: convertContentType(request.mimeType, request.url),
      status: evs.response.args.data.statusCode,
      timing: timing,
      fromCache: evs.response.args.data.fromCache,
      fromServiceWorker: evs.response.args.data.fromServiceWorker,
    }
  }, eventsObj);
};

const findEvents = events => {
  const evs = [
    S.last(S.filter(e => e.name === EventType.ResourceSendRequest, events)),
    S.find(e => e.name === EventType.ResourceReceiveResponse, events),
    S.find(e => e.name === EventType.ResourceFinish, events),
  ];
  return S.map(es => {
    return {
      start: es[0],
      response: es[1],
      finish: es[2],
    };
  }, S.sequence(S.Maybe, evs));
};

const getTiming = request => {
  return S.maybe({}, t => buildTiming(t), S.toMaybe(request.timing));
};

const buildTiming = timing => {
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

const buildRequests = (it) => {
  return requests => S.map(t => buildRequest(t, it), requests);
};

const filterIncompleteRequests = requests => {
  return S.filter(r => r.children.length > 2, requests);
};

const formatSize = size => {
  return Math.round(size);
};

const formatDuration = n => {
  return Math.round(n);
};

const convertContentType = (mimeType, url) => {
  return !R.isNil(ContentType[mimeType]) ? ContentType[mimeType] : getContentTypeByFileExtension(url);
};

const getContentTypeByFileExtension = url => {
  const ext = url.substr(url.lastIndexOf('.') + 1);
  return !R.isNil(Extension[ext]) ? Extension[ext] : ResourceType.Other;
};

module.exports = {
  buildRequests: build,
};
