const fs = require('fs');

const generate = (path, data, url) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  const filename = `${path}/audit.${url.replace(
    /[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi,
    '_'
  )}.${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, '\t'), 'utf-8');
  return filename;
};

module.exports = {
  generateReport: generate,
};
