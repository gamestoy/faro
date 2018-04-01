const ResourceType = {
  Image: 'image',
  Font: 'font',
  Javascript: 'javascript',
  Html: 'html',
  Json: 'json',
};

const ContentType = {
  'image/jpeg': ResourceType.Image,
  'application/javascript': ResourceType.Javascript,
  'text/html': ResourceType.Html,
  'image/webp': ResourceType.Image,
  'font/woff': ResourceType.Font,
  'font/woff2': ResourceType.Font,
  'application/xhtml+xml': ResourceType.Html,
  'image/svg+xml': ResourceType.Image,
  'image/gif': ResourceType.Image,
  'font/ttf': ResourceType.Font,
  'application/json': ResourceType.Json,
};

module.exports = {
  ContentType,
  ResourceType,
};