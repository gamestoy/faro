const ResourceType = {
  Image: 'image',
  Font: 'font',
  Javascript: 'javascript',
  Html: 'html',
  Json: 'json',
  Other: 'other',
  Stylesheet: 'stylesheet',
};

const ContentType = {
  'image/jpeg': ResourceType.Image,
  'image/png': ResourceType.Image,
  'application/javascript': ResourceType.Javascript,
  'text/javascript': ResourceType.Javascript,
  'text/html': ResourceType.Html,
  'image/webp': ResourceType.Image,
  'font/woff': ResourceType.Font,
  'font/woff2': ResourceType.Font,
  'application/xhtml+xml': ResourceType.Html,
  'image/svg+xml': ResourceType.Image,
  'image/gif': ResourceType.Image,
  'font/ttf': ResourceType.Font,
  'application/font-ttf': ResourceType.Font,
  'application/json': ResourceType.Json,
  'text/css': ResourceType.Stylesheet,
};

const Extension = {
  jpeg: ResourceType.Image,
  png: ResourceType.Image,
  js: ResourceType.Javascript,
  woff: ResourceType.Font,
  woff2: ResourceType.Font,
  gif: ResourceType.Image,
  ttf: ResourceType.Font,
  css: ResourceType.Stylesheet,
};

module.exports = {
  ContentType,
  ResourceType,
  Extension,
};
