const fs = require('fs');
const url_parser = require('url');

const generate = (path, data, url) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  const filename = `${path}/audit.${getDomain(url).replace(
    /[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi,
    '_'
  )}.${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, '\t'), 'utf-8');
  return filename;
};

const getDomain = url => {
  return url_parser.parse(url).hostname
};

module.exports = {
  generateReport: generate,
};
